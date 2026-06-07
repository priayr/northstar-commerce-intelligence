import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnalyticsParams, buildOrderWhereClause } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseAnalyticsParams(searchParams);
    const granularity = searchParams.get("granularity") || "month";
    const where = buildOrderWhereClause(params);

    const orders = await prisma.order.findMany({
      where,
      select: {
        orderDate: true,
        items: {
          select: {
            lineTotal: true,
            product: { select: { category: { select: { name: true } } } },
            returnRecord: { select: { refundAmount: true } },
          },
        },
      },
      orderBy: { orderDate: "asc" },
    });

    const trendMap = new Map<string, Record<string, number>>();
    const allCategories = new Set<string>();

    for (const order of orders) {
      let dateKey = order.orderDate.toISOString().split("T")[0];
      if (granularity === "month") {
        dateKey = dateKey.substring(0, 7);
      } else if (granularity === "week") {
        const d = new Date(order.orderDate);
        const day = d.getDay() || 7;
        d.setHours(-24 * (day - 1));
        dateKey = d.toISOString().split("T")[0];
      }

      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, {});
      }

      const dayRecord = trendMap.get(dateKey)!;

      for (const item of order.items) {
        const cat = item.product.category.name;
        allCategories.add(cat);
        const net = item.lineTotal - (item.returnRecord?.refundAmount || 0);
        
        if (!dayRecord[cat]) dayRecord[cat] = 0;
        dayRecord[cat] += net;
      }
    }

    // Identify top 5 categories to stack
    const catTotals = Array.from(allCategories).map(cat => {
      let total = 0;
      for (const rec of Array.from(trendMap.values())) {
        if (rec[cat]) total += rec[cat];
      }
      return { cat, total };
    }).sort((a, b) => b.total - a.total);
    
    const top5Cats = catTotals.slice(0, 5).map(c => c.cat);

    const result = Array.from(trendMap.entries()).map(([date, record]) => {
      const point: any = { date };
      let others = 0;
      
      for (const [cat, val] of Object.entries(record)) {
        if (top5Cats.includes(cat)) {
          point[cat] = val;
        } else {
          others += val;
        }
      }
      if (others > 0) {
        point["Other"] = others;
      }
      
      // Ensure top 5 cats exist in every point (for stacked area to work properly)
      for (const cat of top5Cats) {
        if (point[cat] === undefined) point[cat] = 0;
      }
      if (point["Other"] === undefined && others === 0) point["Other"] = 0;

      return point;
    });

    return NextResponse.json({
      data: result,
      categories: [...top5Cats, "Other"],
    });
  } catch (error) {
    console.error("Category Trend API Error:", error);
    return NextResponse.json({ error: "Failed to fetch category trend" }, { status: 500 });
  }
}
