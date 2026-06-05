import { Prisma } from "@prisma/client";

export function parseAnalyticsParams(searchParams: URLSearchParams) {
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const categoriesStr = searchParams.get("categories");
  const regionsStr = searchParams.get("regions");
  const channelsStr = searchParams.get("channels");

  const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  const endDate = endDateStr ? new Date(endDateStr) : new Date();

  // Calculate previous period
  const durationMs = endDate.getTime() - startDate.getTime();
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - durationMs);

  const categories = categoriesStr ? categoriesStr.split(",") : [];
  const regions = regionsStr ? regionsStr.split(",") : [];
  const channels = channelsStr ? channelsStr.split(",") : [];

  return {
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    categories,
    regions,
    channels,
  };
}

export function buildOrderWhereClause(params: ReturnType<typeof parseAnalyticsParams>): Prisma.OrderWhereInput {
  const { startDate, endDate, categories, regions, channels } = params;

  const where: Prisma.OrderWhereInput = {
    orderDate: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (regions.length > 0) {
    where.region = { in: regions };
  }

  if (channels.length > 0) {
    where.channel = { in: channels };
  }

  if (categories.length > 0) {
    where.items = {
      some: {
        product: {
          category: {
            name: { in: categories },
          },
        },
      },
    };
  }

  return where;
}

export function buildDailyMetricWhereClause(params: ReturnType<typeof parseAnalyticsParams>): Prisma.DailyMetricWhereInput {
  const { startDate, endDate } = params;

  // DailyMetric is aggregated at the top level, so it's harder to filter by category/region/channel dynamically 
  // without re-aggregating on the fly. For perfect accuracy with filters, we should aggregate Orders.
  // However, if no filters are applied, querying DailyMetric is much faster.
  // We'll return just the date range here. The caller must decide whether to use DailyMetric or aggregate Orders.

  return {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };
}
