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
            product: {
              select: {
                category: { select: { name: true } }
              }
            },
            returnRecord: { select: { refundAmount: true } }
          }
        }
      }
    });

    const categoryMap = new Map<string, number>();
    let totalNetRevenue = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const catName = item.product.category.name;
        const refund = item.returnRecord?.refundAmount || 0;
        const net = item.lineTotal - refund;
        
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + net);
        totalNetRevenue += net;
      }
    }

    const breakdown = Array.from(categoryMap.entries())
      .map(([category, revenue]) => ({
        category,
        revenue,
        share: totalNetRevenue > 0 ? (revenue / totalNetRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Category Breakdown API Error:", error);
    return NextResponse.json({ error: "Failed to fetch category breakdown" }, { status: 500 });
  }
}
