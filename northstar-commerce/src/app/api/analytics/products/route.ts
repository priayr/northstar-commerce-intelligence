import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnalyticsParams } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sort = searchParams.get("sort") || "revenue"; // revenue | units | returnRate | margin
    
    // Fetch product performance data (pre-computed materialized view)
    const performances = await prisma.productPerformance.findMany({
      include: {
        product: {
          select: { sku: true, isActive: true },
        },
      },
    });

    const products = performances.map((p) => {
      return {
        id: p.productId,
        product: p.productName,
        sku: p.product.sku,
        category: p.categoryName,
        revenue: p.totalRevenue,
        units: p.totalQuantity,
        margin: p.marginProxy,
        returnRate: p.returnRate,
        repeatPurchaseRate: p.repeatPurchaseRate,
        isActive: p.product.isActive,
      };
    });

    // Sort the data
    products.sort((a, b) => {
      switch (sort) {
        case "units":
          return b.units - a.units;
        case "returnRate":
          return b.returnRate - a.returnRate;
        case "margin":
          return b.margin - a.margin;
        case "revenue":
        default:
          return b.revenue - a.revenue;
      }
    });

    // Compute ABC Class proxy (A = top 20%, B = next 30%, C = bottom 50%)
    // Based on total revenue
    let totalRev = 0;
    products.forEach((p) => (totalRev += p.revenue));
    
    let cumRev = 0;
    const finalProducts = products.map((p) => {
      cumRev += p.revenue;
      const share = cumRev / totalRev;
      let abcClass = "C";
      if (share <= 0.8) abcClass = "A"; // Top 80% of revenue usually comes from ~20% of products
      else if (share <= 0.95) abcClass = "B";
      
      return { ...p, abcClass };
    });

    return NextResponse.json(finalProducts);
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
