"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { KPICard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { useFilterStore } from "@/store/filters";
import { AssociationRulesTable } from "@/components/tables/association-rules-table";
import { AssociationBarChart } from "@/components/charts/association-bar-chart";
import { ItemsPerOrderHistogram } from "@/components/charts/items-per-order-histogram";

export default function BasketPage() {
  const { dateRange } = useFilterStore();
  
  // Fetch from our new Next.js proxy -> FastAPI
  const { data: basketResponse, isLoading: basketLoading } = useAnalytics<any>("/api/analytics/basket", {
    minSupport: "0.01",
    minLift: "1.2"
  });

  const rulesData = basketResponse?.rules || [];
  const basketSummary = basketResponse?.summary || {};

  const dateString = dateRange?.from && dateRange?.to 
    ? `${dateRange.from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${dateRange.to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "All Time (Lifetime)";

  const kpis = [
    {
      label: "Avg Items per Order",
      value: basketSummary.avg_items_per_order || 0,
      trend: 0,
      comparisonText: "vs. previous period",
      format: "number" as const,
      isLoading: basketLoading,
    },
    {
      label: "Multi-Item Order %",
      value: basketSummary.multi_item_order_pct || 0,
      trend: 2.1, // Mock positive trend
      comparisonText: "vs. previous period",
      format: "percent" as const,
      isLoading: basketLoading,
    },
    {
      label: "Top Association Lift",
      value: basketSummary.top_lift || 0,
      trend: 0, 
      comparisonText: "strongest product correlation",
      format: "number" as const,
      isLoading: basketLoading,
    },
    {
      label: "Bundle Opportunities",
      value: basketSummary.bundle_opportunities || 0,
      trend: 0, 
      comparisonText: "rules with >2.0x lift",
      format: "number" as const,
      isLoading: basketLoading,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary">Basket & Affinity Analysis</h1>
          <p className="text-sm text-text-secondary mt-1">{dateString}</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Full-width Association Rules Table */}
      <div className="w-full">
        <ChartCard 
          title="Market Basket Association Rules" 
          subtitle="Identified using the Apriori algorithm. Sorted by Lift (likelihood of co-purchase)."
        >
          <AssociationRulesTable data={rulesData} isLoading={basketLoading} />
        </ChartCard>
      </div>

      {/* Two-Column: Top Bundles vs Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Top 20 Bundles by Lift"
          subtitle="Visualizing the strongest product combinations"
          height={400}
          isLoading={basketLoading}
        >
          <AssociationBarChart data={rulesData} />
        </ChartCard>
        
        <ChartCard
          title="Items per Order Distribution"
          subtitle="Frequency of basket sizes across all orders"
          height={400}
        >
          <ItemsPerOrderHistogram />
        </ChartCard>
      </div>
    </div>
  );
}
