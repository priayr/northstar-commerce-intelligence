import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const metric = searchParams.get("metric") || "revenue";
    const horizon = parseInt(searchParams.get("horizon") || "30", 10);
    
    // Fetch daily aggregated data
    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { order_date: true, total: true },
      orderBy: { order_date: 'asc' }
    });
    
    // Group by day
    const dailyMap = new Map<string, number>();
    orders.forEach(o => {
      const d = o.order_date.toISOString().split('T')[0];
      const val = metric === "orders" ? 1 : Number(o.total);
      dailyMap.set(d, (dailyMap.get(d) || 0) + val);
    });
    
    const timeseries = Array.from(dailyMap.entries()).map(([date, val]) => ({
      date,
      [metric]: val
    }));
    
    // Send to FastAPI
    const response = await fetch("http://127.0.0.1:8001/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: timeseries, horizon })
    });
    
    if (!response.ok) {
      throw new Error(`FastAPI returned ${response.status}`);
    }
    
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error("Forecast Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
