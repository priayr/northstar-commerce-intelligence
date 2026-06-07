"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { KPICard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { useFilterStore } from "@/store/filters";
import { RFMTreemap } from "@/components/charts/rfm-treemap";
import { CohortHeatmap } from "@/components/charts/cohort-heatmap";
import { CustomerSegmentTable } from "@/components/tables/customer-segment-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Users2 } from "lucide-react";

// We'll mock the new vs returning chart for this demo layout, 
// normally this would come from an API.
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MOCK_RETURNING_TREND = [
  { date: "W1", new: 400, returning: 240 },
  { date: "W2", new: 300, returning: 298 },
  { date: "W3", new: 200, returning: 380 },
  { date: "W4", new: 278, returning: 408 },
  { date: "W5", new: 189, returning: 480 },
];

export default function CustomersPage() {
  const { dateRange } = useFilterStore();
  
  // Fetch from our new Next.js proxies -> FastAPI
  const { data: rfmResponse, isLoading: rfmLoading } = useAnalytics<any>("/api/analytics/customers");
  const { data: cohortResponse, isLoading: cohortLoading } = useAnalytics<any>("/api/analytics/cohort");

  const rfmData = rfmResponse?.data || [];
  const rfmSummary = rfmResponse?.summary || {};

  const dateString = dateRange?.from && dateRange?.to 
    ? `${dateRange.from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${dateRange.to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "All Time (Lifetime)";

  const totalCust = rfmSummary.total_customers || 0;
  const newCust = rfmSummary.new_customers || 0;
  const returnPct = totalCust > 0 ? ((totalCust - newCust) / totalCust) * 100 : 0;

  const kpis = [
    {
      label: "Total Customers",
      value: totalCust,
      trend: 0,
      comparisonText: "vs. previous period",
      format: "number" as const,
      isLoading: rfmLoading,
    },
    {
      label: "Returning Customer %",
      value: returnPct,
      trend: 5.2, // Mock positive trend
      comparisonText: "vs. previous period",
      format: "percent" as const,
      isLoading: rfmLoading,
    },
    {
      label: "Avg LTV Proxy",
      value: rfmSummary.avg_ltv || 0,
      trend: 0, 
      comparisonText: "lifetime spend per customer",
      format: "currency" as const,
      isLoading: rfmLoading,
    },
    {
      label: "Avg Orders per Customer",
      value: rfmSummary.avg_orders || 0,
      trend: 0, 
      comparisonText: "lifetime purchase frequency",
      format: "number" as const,
      isLoading: rfmLoading,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary">Customer Intelligence</h1>
          <p className="text-sm text-text-secondary mt-1">{dateString}</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Two-Column: Acquisition vs Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Acquisition vs Retention"
          subtitle="New vs Returning customer volume over time"
          height={320}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_RETURNING_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--color-surface-0)", borderColor: "var(--color-border-strong)", borderRadius: "6px" }}
              />
              <Area type="monotone" dataKey="returning" stackId="1" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="new" stackId="1" stroke="var(--color-chart-5)" fill="var(--color-chart-5)" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard
          title="RFM Segmentation"
          subtitle="Customer base distribution by Recency, Frequency, and Monetary value"
          height={320}
          isLoading={rfmLoading}
        >
          <RFMTreemap data={rfmData} />
        </ChartCard>
      </div>

      {/* Full-width Cohort Heatmap */}
      <div className="w-full">
        <ChartCard
          title="Monthly Cohort Retention"
          subtitle="Percentage of customers returning to purchase in subsequent months"
          isLoading={cohortLoading}
        >
          <div className="pt-4">
            {!cohortLoading && (!cohortResponse?.matrix || Object.keys(cohortResponse.matrix).length === 0) ? (
               <EmptyState 
                 icon={Users2}
                 title="Not enough data for cohort analysis"
                 description="Try selecting a longer date range (e.g., Year to Date) to visualize returning customer cohorts."
               />
            ) : (
              <CohortHeatmap data={cohortResponse} />
            )}
          </div>
        </ChartCard>
      </div>

      {/* Table */}
      <div className="w-full">
        <ChartCard title="Customer Segments Summary" subtitle="Performance and recommended actions per segment">
          <CustomerSegmentTable data={rfmData} isLoading={rfmLoading} />
        </ChartCard>
      </div>
    </div>
  );
}
