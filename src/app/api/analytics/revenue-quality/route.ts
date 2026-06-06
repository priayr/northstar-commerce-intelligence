import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnalyticsParams, buildOrderWhereClause } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseAnalyticsParams(searchParams);

    const currentWhere = buildOrderWhereClause(params);
    const prevWhere = buildOrderWhereClause({
      ...params,
      startDate: params.prevStartDate,
      endDate: params.prevEndDate,
    });

    async function getRevenueQuality(where: typeof currentWhere) {
      const orders = await prisma.order.findMany({
        where,
        select: {
          total: true,
          subtotal: true,
          discountAmount: true,
          customerId: true,
          items: {
            select: {
              returnRecord: { select: { refundAmount: true } },
            },
          },
        },
      });

      let grossRevenue = 0;
      let discountAmount = 0;
      let returnLeakage = 0;
      const customerIds = new Set<string>();

      for (const order of orders) {
        grossRevenue += order.total;
        discountAmount += order.discountAmount;
        customerIds.add(order.customerId);
        
        for (const item of order.items) {
          if (item.returnRecord) {
            returnLeakage += item.returnRecord.refundAmount;
          }
        }
      }

      const netRevenue = grossRevenue - returnLeakage;
      const uniqueCustomers = customerIds.size;
      const revenuePerCustomer = uniqueCustomers > 0 ? netRevenue / uniqueCustomers : 0;
      const discountImpact = grossRevenue > 0 ? (discountAmount / grossRevenue) * 100 : 0;

      return {
        grossRevenue,
        netRevenue,
        discountImpact,
        returnLeakage,
        revenuePerCustomer,
      };
    }

    const current = await getRevenueQuality(currentWhere);
    const prev = await getRevenueQuality(prevWhere);

    // Calculate MoM growth (assuming current period vs previous is MoM if it's 30 days, but we label it generically as period growth)
    const momGrowth = prev.netRevenue > 0 
      ? ((current.netRevenue - prev.netRevenue) / prev.netRevenue) * 100 
      : 100;

    return NextResponse.json({
      ...current,
      momGrowth,
      previousPeriod: prev,
    });
  } catch (error) {
    console.error("Revenue Quality API Error:", error);
    return NextResponse.json({ error: "Failed to fetch revenue quality metrics" }, { status: 500 });
  }
}
