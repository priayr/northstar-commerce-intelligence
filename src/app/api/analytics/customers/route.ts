import { NextRequest, NextResponse } from "next/server";
import { parseAnalyticsParams } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseAnalyticsParams(searchParams);
    
    // Call the Python FastAPI service
    const pythonPayload = {};
    if (params.startDate) pythonPayload["start_date"] = params.startDate.toISOString().split("T")[0];
    if (params.endDate) pythonPayload["end_date"] = params.endDate.toISOString().split("T")[0];

    const response = await fetch("http://127.0.0.1:8001/rfm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pythonPayload),
      // Set revalidate/cache as needed
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Python service responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Customers API Proxy Error:", error);
    return NextResponse.json({ error: "Failed to fetch customer segments from analytics service" }, { status: 500 });
  }
}
