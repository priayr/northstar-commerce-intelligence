import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Basic heuristic generation based on day of week or month
function generateHeuristicCause(dateStr: string, severity: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const month = d.getMonth();
  
  if (severity === "spike") {
    if (month === 10 || month === 11) return "Holiday promotion spike";
    if (day === 5 || day === 6) return "Weekend sales bump";
    return "Flash sale or targeted email campaign";
  } else {
    if (day === 1 || day === 2) return "Start of week lull";
    return "Platform outage or tracking missing";
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const metric = searchParams.get("metric") || "revenue";
    
    // Fetch daily aggregated data
    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { order_date: true, total: true },
      orderBy: { order_date: 'asc' }
    });
    
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
    const response = await fetch("http://127.0.0.1:8001/anomalies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: timeseries })
    });
    
    if (!response.ok) {
      throw new Error(`FastAPI returned ${response.status}`);
    }
    
    const result = await response.json();
    
    // Add heuristics
    if (result.anomalies && Array.isArray(result.anomalies)) {
      result.anomalies = result.anomalies.map((a: any) => ({
        ...a,
        cause: generateHeuristicCause(a.date, a.severity)
      }));
    }
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error("Anomalies Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
