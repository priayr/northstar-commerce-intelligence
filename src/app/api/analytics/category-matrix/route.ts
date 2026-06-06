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

    async function getCategoryStats(where: typeof currentWhere) {
      const orders = await prisma.order.findMany({
        where,
        select: {
          items: {
            select: {
              lineTotal: true,
              product: {
                select: {
                  id: true,
                  category: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      const catMap = new Map<string, { revenue: number; productIds: Set<string> }>();

      for (const order of orders) {
        for (const item of order.items) {
          const cat = item.product.category.name;
          if (!catMap.has(cat)) {
            catMap.set(cat, { revenue: 0, productIds: new Set() });
          }
          const data = catMap.get(cat)!;
          data.revenue += item.lineTotal;
          data.productIds.add(item.product.id);
        }
      }

      return catMap;
    }

    const currentStats = await getCategoryStats(currentWhere);
    const prevStats = await getCategoryStats(prevWhere);

    const matrix = Array.from(currentStats.entries()).map(([category, current]) => {
      const prev = prevStats.get(category);
      const growthRate = prev && prev.revenue > 0 
        ? ((current.revenue - prev.revenue) / prev.revenue) * 100 
        : 0;
      
      return {
        category,
        revenue: current.revenue,
        growthRate,
        productCount: current.productIds.size,
      };
    });

    return NextResponse.json(matrix);
  } catch (error) {
    console.error("Category Matrix API Error:", error);
    return NextResponse.json({ error: "Failed to fetch category matrix" }, { status: 500 });
  }
}
