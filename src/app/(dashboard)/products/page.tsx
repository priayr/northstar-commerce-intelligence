"use client";

import { useMemo } from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import { KPICard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { useFilterStore } from "@/store/filters";
import { CategoryScatterChart } from "@/components/charts/category-scatter-chart";
import { ProductMixStackedAreaChart } from "@/components/charts/product-mix-stacked-area-chart";
import { ProductPerformanceTable } from "@/components/tables/product-performance-table";

export default function ProductsPage() {
  const { dateRange } = useFilterStore();
  
  // Fetch metrics
  const { data: products, isLoading: productsLoading } = useAnalytics<any[]>("/api/analytics/products");
  const { data: matrix, isLoading: matrixLoading } = useAnalytics<any>("/api/analytics/category-matrix");
  const { data: trend, isLoading: trendLoading } = useAnalytics<any>("/api/analytics/category-trend");

  const dateString = dateRange?.from && dateRange?.to 
    ? `${dateRange.from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${dateRange.to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "All Time";

  // Calculate KPIs dynamically from products data
  const kpiData = useMemo(() => {
    if (!products || products.length === 0) return { activeCount: 0, topShare: 0, avgMargin: 0, highReturnCount: 0 };
    
    let totalRev = 0;
    let totalMargin = 0;
    let activeCount = 0;
    let highReturnCount = 0;

    products.forEach(p => {
      totalRev += p.revenue;
      totalMargin += p.margin;
      if (p.isActive) activeCount++;
      if (p.returnRate > 0.1) highReturnCount++; // Assuming > 10% is "high return"
    });

    const topProductRev = products[0]?.revenue || 0;
    const topShare = totalRev > 0 ? (topProductRev / totalRev) * 100 : 0;
    const avgMargin = (totalMargin / products.length) * 100;

    return { activeCount, topShare, avgMargin, highReturnCount };
  }, [products]);

  const kpis = [
    {
      label: "Active Products",
      value: kpiData.activeCount,
      trend: 0, // Mock trend
      comparisonText: "vs. previous period",
      format: "number" as const,
      isLoading: productsLoading,
    },
    {
      label: "Top Product Share",
      value: kpiData.topShare,
      trend: 0, 
      comparisonText: "vs. previous period",
      format: "percent" as const,
      isLoading: productsLoading,
    },
    {
      label: "Avg Margin Proxy",
      value: kpiData.avgMargin,
      trend: 0, 
      comparisonText: "vs. previous period",
      format: "percent" as const,
      isLoading: productsLoading,
    },
    {
      label: "High-Return Products",
      value: kpiData.highReturnCount,
      trend: 0, 
      comparisonText: "products with >10% returns",
      format: "number" as const,
      isLoading: productsLoading,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary">Product & Category Intelligence</h1>
          <p className="text-sm text-text-secondary mt-1">{dateString}</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Category Performance Matrix"
          subtitle="Revenue vs Growth Rate (bubble size = product count)"
          height={350}
          isLoading={matrixLoading}
        >
          <CategoryScatterChart data={matrix} />
        </ChartCard>
        
        <ChartCard
          title="Product Mix Over Time"
          subtitle="Net revenue stacked by top 5 categories"
          height={350}
          isLoading={trendLoading}
        >
          <ProductMixStackedAreaChart data={trend} />
        </ChartCard>
      </div>

      {/* Table */}
      <div className="w-full">
        <ChartCard title="Full Product Performance" subtitle="Detailed product metrics with ABC classification">
          <ProductPerformanceTable data={products} isLoading={productsLoading} />
        </ChartCard>
      </div>
    </div>
  );
}
