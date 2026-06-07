import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnalyticsParams, buildOrderWhereClause } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseAnalyticsParams(searchParams);
    const where = buildOrderWhereClause(params);

    const orders = await prisma.order.findMany({
      where,
      select: {
        items: {
          select: {
            lineTotal: true,
            product: { select: { id: true, name: true } },
            returnRecord: { select: { refundAmount: true } },
          },
        },
      },
    });

    const productMap = new Map<string, { name: string; revenue: number }>();
    let totalRevenue = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const net = item.lineTotal - (item.returnRecord?.refundAmount || 0);
        if (net > 0) {
          if (!productMap.has(item.product.id)) {
            productMap.set(item.product.id, { name: item.product.name, revenue: 0 });
          }
          productMap.get(item.product.id)!.revenue += net;
          totalRevenue += net;
        }
      }
    }

    // Sort descending by revenue
    const sortedProducts = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);

    // Calculate cumulative share
    let cumulativeRevenue = 0;
    const paretoData = sortedProducts.map((p) => {
      cumulativeRevenue += p.revenue;
      return {
        product: p.name,
        revenue: p.revenue,
        cumulativeShare: (cumulativeRevenue / totalRevenue) * 100,
      };
    });

    // For visualization, we might not want to send all 120 products if the tail is long.
    // Let's take top 30 to make the chart readable.
    return NextResponse.json(paretoData.slice(0, 30));
  } catch (error) {
    console.error("Pareto API Error:", error);
    return NextResponse.json({ error: "Failed to fetch pareto data" }, { status: 500 });
  }
}
