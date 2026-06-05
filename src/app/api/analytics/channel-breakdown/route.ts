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
        channel: true,
        total: true,
        items: {
          select: {
            returnRecord: { select: { refundAmount: true } }
          }
        }
      }
    });

    const channelMap = new Map<string, number>();

    for (const order of orders) {
      const channel = order.channel;
      let refund = 0;
      for (const item of order.items) {
        if (item.returnRecord) refund += item.returnRecord.refundAmount;
      }
      const net = order.total - refund;
      
      channelMap.set(channel, (channelMap.get(channel) || 0) + net);
    }

    const breakdown = Array.from(channelMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Channel Breakdown API Error:", error);
    return NextResponse.json({ error: "Failed to fetch channel breakdown" }, { status: 500 });
  }
}
