"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { KPICard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { useFilterStore } from "@/store/filters";
import { GrossNetAreaChart } from "@/components/charts/gross-net-area-chart";
import { RevenueDayOfWeekChart } from "@/components/charts/revenue-day-of-week-chart";
import { ParetoChart } from "@/components/charts/pareto-chart";
import { RevenueBreakdownTable } from "@/components/tables/revenue-breakdown-table";

export default function RevenuePage() {
  const { dateRange } = useFilterStore();
  
  // Fetch metrics
  const { data: quality, isLoading: qualityLoading } = useAnalytics<any>("/api/analytics/revenue-quality");
  const { data: trend, isLoading: trendLoading } = useAnalytics<any>("/api/analytics/revenue-trend");
  const { data: pareto, isLoading: paretoLoading } = useAnalytics<any>("/api/analytics/pareto");
  const { data: breakdown, isLoading: breakdownLoading } = useAnalytics<any>("/api/analytics/category-revenue-quality");

  const dateString = dateRange?.from && dateRange?.to 
    ? `${dateRange.from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${dateRange.to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "All Time";

  // Calculate trends
  const calcTrend = (curr: number, prev: number) => {
    if (!prev) return 100;
    return ((curr - prev) / prev) * 100;
  };

  const kpis = [
    {
      label: "Gross Revenue",
      value: quality?.grossRevenue || 0,
      trend: calcTrend(quality?.grossRevenue, quality?.previousPeriod?.grossRevenue),
      comparisonText: "vs. previous period",
      format: "currency" as const,
      isLoading: qualityLoading,
    },
    {
      label: "Net Revenue",
      value: quality?.netRevenue || 0,
      trend: calcTrend(quality?.netRevenue, quality?.previousPeriod?.netRevenue),
      comparisonText: "vs. previous period",
      format: "currency" as const,
      isLoading: qualityLoading,
    },
    {
      label: "Discount Impact",
      value: quality?.discountImpact || 0,
      trend: calcTrend(quality?.discountImpact, quality?.previousPeriod?.discountImpact),
      comparisonText: "vs. previous period",
      format: "percent" as const,
      isLoading: qualityLoading,
    },
    {
      label: "Return Leakage",
      value: quality?.returnLeakage || 0,
      trend: calcTrend(quality?.returnLeakage, quality?.previousPeriod?.returnLeakage),
      comparisonText: "vs. previous period",
      format: "currency" as const,
      isLoading: qualityLoading,
    },
    {
      label: "Rev per Customer",
      value: quality?.revenuePerCustomer || 0,
      trend: calcTrend(quality?.revenuePerCustomer, quality?.previousPeriod?.revenuePerCustomer),
      comparisonText: "vs. previous period",
      format: "currency" as const,
      isLoading: qualityLoading,
    },
    {
      label: "MoM Growth",
      value: quality?.momGrowth || 0,
      trend: 0, // Since this IS the trend, we don't need a trend-of-trend
      comparisonText: "period over period",
      format: "percent" as const,
      isLoading: qualityLoading,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary">Revenue Quality Analysis</h1>
          <p className="text-sm text-text-secondary mt-1">{dateString}</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Primary Chart */}
      <div className="w-full">
        <ChartCard
          title="Gross vs Net Revenue Over Time"
          subtitle="Comparing top-line revenue against post-return, post-discount net revenue"
          height={320}
          isLoading={trendLoading}
        >
          <GrossNetAreaChart data={trend} />
        </ChartCard>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Product Pareto Distribution"
          subtitle="Cumulative revenue share by product (80/20 rule)"
          height={320}
          isLoading={paretoLoading}
        >
          <ParetoChart data={pareto} />
        </ChartCard>
        
        <ChartCard
          title="Revenue by Day of Week"
          subtitle="Net revenue grouped by day to identify weekly seasonality"
          height={320}
          isLoading={trendLoading}
        >
          <RevenueDayOfWeekChart data={trend} />
        </ChartCard>
      </div>

      {/* Table */}
      <div className="w-full">
        <ChartCard title="Revenue Quality Breakdown" subtitle="Detailed breakdown of revenue flow by category">
          <RevenueBreakdownTable data={breakdown} isLoading={breakdownLoading} />
        </ChartCard>
      </div>
    </div>
  );
}
