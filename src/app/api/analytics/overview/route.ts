import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnalyticsParams, buildOrderWhereClause } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseAnalyticsParams(searchParams);

    // Calculate current period metrics
    const currentWhere = buildOrderWhereClause(params);
    const prevWhere = buildOrderWhereClause({
      ...params,
      startDate: params.prevStartDate,
      endDate: params.prevEndDate,
    });

    // Helper to fetch metrics
    async function getMetrics(where: typeof currentWhere) {
      const orders = await prisma.order.findMany({
        where,
        select: {
          id: true,
          total: true,
          subtotal: true,
          discountAmount: true,
          customerId: true,
          items: {
            select: {
              quantity: true,
              returnRecord: {
                select: { refundAmount: true },
              },
            },
          },
        },
      });

      let grossRevenue = 0;
      let refundAmount = 0;
      let unitsSold = 0;
      const customerIds = new Set<string>();

      for (const order of orders) {
        grossRevenue += order.total;
        customerIds.add(order.customerId);
        for (const item of order.items) {
          unitsSold += item.quantity;
          if (item.returnRecord) {
            refundAmount += item.returnRecord.refundAmount;
          }
        }
      }

      const netRevenue = grossRevenue - refundAmount;
      const totalOrders = orders.length;
      const aov = totalOrders > 0 ? netRevenue / totalOrders : 0;
      const refundRate = grossRevenue > 0 ? (refundAmount / grossRevenue) * 100 : 0;

      // Repeat customer rate (approximation for the period: orders > unique customers means repeats)
      // For true repeat rate, we'd need historical context, but this is a proxy.
      const uniqueCustomers = customerIds.size;
      const repeatCustomerRate = uniqueCustomers > 0 ? ((totalOrders - uniqueCustomers) / totalOrders) * 100 : 0;

      return {
        grossRevenue,
        netRevenue,
        totalOrders,
        aov,
        unitsSold,
        repeatCustomerRate,
        refundRate,
      };
    }

    const currentMetrics = await getMetrics(currentWhere);
    const prevMetrics = await getMetrics(prevWhere);

    return NextResponse.json({
      ...currentMetrics,
      previousPeriod: prevMetrics,
    });
  } catch (error) {
    console.error("Overview API Error:", error);
    return NextResponse.json({ error: "Failed to fetch overview metrics" }, { status: 500 });
  }
}
