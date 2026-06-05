import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnalyticsParams, buildOrderWhereClause } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseAnalyticsParams(searchParams);
    const granularity = searchParams.get("granularity") || "day"; // day | week | month

    const currentWhere = buildOrderWhereClause(params);
    const prevWhere = buildOrderWhereClause({
      ...params,
      startDate: params.prevStartDate,
      endDate: params.prevEndDate,
    });

    // Helper to fetch and group metrics
    async function getTrendData(where: typeof currentWhere) {
      const orders = await prisma.order.findMany({
        where,
        select: {
          orderDate: true,
          total: true,
          items: {
            select: {
              returnRecord: {
                select: { refundAmount: true },
              },
            },
          },
        },
        orderBy: { orderDate: "asc" },
      });

      const grouped = new Map<string, { date: string; grossRevenue: number; netRevenue: number; orders: number }>();

      for (const order of orders) {
        let dateKey = order.orderDate.toISOString().split("T")[0]; // default 'day'

        if (granularity === "month") {
          dateKey = dateKey.substring(0, 7); // YYYY-MM
        } else if (granularity === "week") {
          // simple approximation: align to Monday
          const d = new Date(order.orderDate);
          const day = d.getDay() || 7;
          d.setHours(-24 * (day - 1));
          dateKey = d.toISOString().split("T")[0];
        }

        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, { date: dateKey, grossRevenue: 0, netRevenue: 0, orders: 0 });
        }

        const group = grouped.get(dateKey)!;
        let refundAmount = 0;
        for (const item of order.items) {
          if (item.returnRecord) {
            refundAmount += item.returnRecord.refundAmount;
          }
        }

        group.grossRevenue += order.total;
        group.netRevenue += (order.total - refundAmount);
        group.orders += 1;
      }

      return Array.from(grouped.values());
    }

    const currentTrend = await getTrendData(currentWhere);
    const prevTrend = await getTrendData(prevWhere);

    return NextResponse.json({
      current: currentTrend,
      previous: prevTrend,
    });
  } catch (error) {
    console.error("Revenue Trend API Error:", error);
    return NextResponse.json({ error: "Failed to fetch revenue trend" }, { status: 500 });
  }
}
