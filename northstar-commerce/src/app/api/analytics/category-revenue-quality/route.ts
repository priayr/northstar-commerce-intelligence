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

    async function getCategoryData(where: typeof currentWhere) {
      const orders = await prisma.order.findMany({
        where,
        select: {
          items: {
            select: {
              lineTotal: true,
              discount: true,
              product: { select: { category: { select: { name: true } } } },
              returnRecord: { select: { refundAmount: true } },
            },
          },
        },
      });

      const catMap = new Map<string, { gross: number; net: number; discount: number; returns: number }>();

      for (const order of orders) {
        for (const item of order.items) {
          const cat = item.product.category.name;
          if (!catMap.has(cat)) {
            catMap.set(cat, { gross: 0, net: 0, discount: 0, returns: 0 });
          }
          const data = catMap.get(cat)!;
          
          const gross = item.lineTotal + item.discount;
          const refund = item.returnRecord?.refundAmount || 0;
          const net = item.lineTotal - refund;

          data.gross += gross;
          data.net += net;
          data.discount += item.discount;
          data.returns += refund;
        }
      }

      return catMap;
    }

    const currentMap = await getCategoryData(currentWhere);
    const prevMap = await getCategoryData(prevWhere);

    const breakdown = Array.from(currentMap.entries()).map(([category, current]) => {
      const prev = prevMap.get(category);
      const delta = prev && prev.net > 0 ? ((current.net - prev.net) / prev.net) * 100 : 0;
      
      return {
        category,
        gross: current.gross,
        net: current.net,
        discount: current.discount,
        returns: current.returns,
        netPercent: current.gross > 0 ? (current.net / current.gross) * 100 : 0,
        delta,
      };
    }).sort((a, b) => b.gross - a.gross);

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Category Revenue Quality API Error:", error);
    return NextResponse.json({ error: "Failed to fetch category revenue quality" }, { status: 500 });
  }
}
