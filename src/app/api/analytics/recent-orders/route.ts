import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnalyticsParams, buildOrderWhereClause } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = parseAnalyticsParams(searchParams);
    const where = buildOrderWhereClause(params);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderDate: true,
        total: true,
        status: true,
        channel: true,
        customer: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { orderDate: "desc" },
      take: limit,
    });

    const recentOrders = orders.map(order => ({
      id: order.id,
      customer: order.customer.name,
      date: order.orderDate.toISOString(),
      total: order.total,
      status: order.status,
      channel: order.channel,
    }));

    return NextResponse.json(recentOrders);
  } catch (error) {
    console.error("Recent Orders API Error:", error);
    return NextResponse.json({ error: "Failed to fetch recent orders" }, { status: 500 });
  }
}
