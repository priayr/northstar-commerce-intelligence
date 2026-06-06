import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnalyticsParams, buildOrderWhereClause } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseAnalyticsParams(searchParams);
    const where = buildOrderWhereClause(params);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const orders = await prisma.order.findMany({
      where,
      select: {
        items: {
          select: {
            quantity: true,
            lineTotal: true,
            product: {
              select: {
                id: true,
                name: true,
                category: { select: { name: true } }
              }
            },
            returnRecord: { select: { refundAmount: true } }
          }
        }
      }
    });

    const productMap = new Map<string, { product: string; category: string; revenue: number; units: number; returnAmount: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const pId = item.product.id;
        const refund = item.returnRecord?.refundAmount || 0;
        const net = item.lineTotal - refund;
        
        if (!productMap.has(pId)) {
          productMap.set(pId, {
            product: item.product.name,
            category: item.product.category.name,
            revenue: 0,
            units: 0,
            returnAmount: 0
          });
        }
        
        const prodData = productMap.get(pId)!;
        prodData.revenue += net;
        prodData.units += item.quantity;
        prodData.returnAmount += refund;
      }
    }

    const topProducts = Array.from(productMap.values())
      .map(p => ({
        product: p.product,
        category: p.category,
        revenue: p.revenue,
        units: p.units,
        returnRate: p.revenue + p.returnAmount > 0 ? (p.returnAmount / (p.revenue + p.returnAmount)) * 100 : 0,
        trend: [Math.random() * 10, Math.random() * 20, Math.random() * 15, Math.random() * 30, Math.random() * 25] // Mock sparkline trend for now
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return NextResponse.json(topProducts);
  } catch (error) {
    console.error("Top Products API Error:", error);
    return NextResponse.json({ error: "Failed to fetch top products" }, { status: 500 });
  }
}
