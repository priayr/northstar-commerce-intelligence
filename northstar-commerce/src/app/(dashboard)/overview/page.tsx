"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { KPICard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { useFilterStore } from "@/store/filters";
import { RevenueTrendChart } from "@/components/charts/revenue-trend-chart";
import { ChannelDonutChart } from "@/components/charts/channel-donut-chart";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";
import { OrdersBarChart } from "@/components/charts/orders-bar-chart";
import { TopProductsTable } from "@/components/tables/top-products-table";
import { RecentOrdersTable } from "@/components/tables/recent-orders-table";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";

export default function OverviewPage() {
  const { dateRange, resetFilters } = useFilterStore();
  
  // Fetch overview KPIs
  const { data: overview, isLoading: overviewLoading } = useAnalytics<any>("/api/analytics/overview");
  
  // Fetch charts data
  const { data: revenueTrend, isLoading: trendLoading } = useAnalytics<any>("/api/analytics/revenue-trend");
  const { data: categoryBreakdown, isLoading: categoryLoading } = useAnalytics<any>("/api/analytics/category-breakdown");
  const { data: channelBreakdown, isLoading: channelLoading } = useAnalytics<any>("/api/analytics/channel-breakdown");
  
  // Fetch tables data
  const { data: topProducts, isLoading: productsLoading } = useAnalytics<any>("/api/analytics/top-products", { limit: "10" });
  const { data: recentOrders, isLoading: ordersLoading } = useAnalytics<any>("/api/analytics/recent-orders", { limit: "20" });

  const dateString = dateRange?.from && dateRange?.to 
    ? `${dateRange.from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${dateRange.to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "All Time";

  // Calculate trends for KPIs
  const calcTrend = (curr: number, prev: number) => {
    if (!prev) return 100;
    return ((curr - prev) / prev) * 100;
  };

  const kpis = [
    {
      label: "Net Revenue",
      value: overview?.netRevenue || 0,
      trend: calcTrend(overview?.netRevenue, overview?.previousPeriod?.netRevenue),
      comparisonText: "vs. previous period",
      format: "currency" as const,
      isLoading: overviewLoading,
    },
    {
      label: "Total Orders",
      value: overview?.totalOrders || 0,
      trend: calcTrend(overview?.totalOrders, overview?.previousPeriod?.totalOrders),
      comparisonText: "vs. previous period",
      format: "number" as const,
      isLoading: overviewLoading,
    },
    {
      label: "Average Order Value",
      value: overview?.aov || 0,
      trend: calcTrend(overview?.aov, overview?.previousPeriod?.aov),
      comparisonText: "vs. previous period",
      format: "currency" as const,
      isLoading: overviewLoading,
    },
    {
      label: "Units Sold",
      value: overview?.unitsSold || 0,
      trend: calcTrend(overview?.unitsSold, overview?.previousPeriod?.unitsSold),
      comparisonText: "vs. previous period",
      format: "number" as const,
      isLoading: overviewLoading,
    },
    {
      label: "Repeat Customer Rate",
      value: overview?.repeatCustomerRate || 0,
      trend: calcTrend(overview?.repeatCustomerRate, overview?.previousPeriod?.repeatCustomerRate),
      comparisonText: "vs. previous period",
      format: "percent" as const,
      isLoading: overviewLoading,
    },
    {
      label: "Refund Rate",
      value: overview?.refundRate || 0,
      trend: calcTrend(overview?.refundRate, overview?.previousPeriod?.refundRate),
      comparisonText: "vs. previous period",
      format: "percent" as const,
      isLoading: overviewLoading,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary">Commerce Overview</h1>
          <p className="text-sm text-text-secondary mt-1">{dateString}</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {!overviewLoading && overview?.totalOrders === 0 ? (
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-border-strong)] rounded-xl mt-4">
          <EmptyState 
            icon={SearchX}
            title="No orders matched your filters"
            description="Try selecting a different date range to see your commerce overview."
            actionLabel="Reset filters"
            onAction={() => resetFilters()}
          />
        </div>
      ) : (
        <>
          {/* Primary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-2">
            <div className="lg:col-span-3">
              <ChartCard
                title="Revenue Trend"
                subtitle="Net revenue, current vs. previous period"
                height={300}
                isLoading={trendLoading}
              >
                <RevenueTrendChart data={revenueTrend} />
              </ChartCard>
            </div>
            <div className="lg:col-span-2">
              <ChartCard
                title="Revenue by Channel"
                subtitle="Net revenue by acquisition channel"
                height={300}
                isLoading={channelLoading}
              >
                <ChannelDonutChart data={channelBreakdown} />
              </ChartCard>
            </div>
          </div>

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Revenue by Category"
              subtitle="Top categories by net revenue"
              height={300}
              isLoading={categoryLoading}
            >
              <CategoryBarChart data={categoryBreakdown} />
            </ChartCard>
            <ChartCard
              title="Orders by Day"
              subtitle="Daily order volume in current period"
              height={300}
              isLoading={trendLoading}
            >
              <OrdersBarChart data={revenueTrend} />
            </ChartCard>
          </div>

          {/* Tables */}
          <div className="flex flex-col gap-4">
            <ChartCard title="Top Performing Products" subtitle="Top 10 products by revenue">
              <TopProductsTable data={topProducts} isLoading={productsLoading} />
            </ChartCard>

            <ChartCard title="Recent Orders" subtitle="Latest 20 orders in the selected period">
              <RecentOrdersTable data={recentOrders} isLoading={ordersLoading} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
