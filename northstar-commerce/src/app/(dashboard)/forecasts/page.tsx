"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { KPICard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { AnomalyChart } from "@/components/charts/anomaly-chart";
import { AnomalyLogTable } from "@/components/tables/anomaly-log-table";

export default function ForecastsPage() {
  // Fetch from the Next.js proxies that route to our Python FastAPI service
  const { data: forecastData, isLoading: forecastLoading } = useAnalytics<any>("/api/analytics/forecast?horizon=30");
  const { data: anomaliesData, isLoading: anomaliesLoading } = useAnalytics<any>("/api/analytics/anomalies");

  // Calculate KPIs based on returned models
  const forecastSum = forecastData?.forecast?.reduce((acc: number, f: any) => acc + f.predicted, 0) || 0;
  
  // Projected growth trajectory
  const lastHistorical = forecastData?.historical?.[forecastData.historical.length - 1]?.value || 0;
  const lastForecast = forecastData?.forecast?.[forecastData.forecast.length - 1]?.predicted || 0;
  const trendPct = lastHistorical ? ((lastForecast - lastHistorical) / lastHistorical) * 100 : 0;
  
  const anomalyCount = anomaliesData?.anomalies?.length || 0;

  const kpis = [
    {
      label: "30-Day Revenue Forecast",
      value: forecastSum,
      trend: trendPct,
      comparisonText: "Projected cumulative sum",
      format: "currency" as const,
      isLoading: forecastLoading,
    },
    {
      label: "Projected Direction",
      value: trendPct,
      trend: trendPct,
      comparisonText: "Expected baseline shift at Day 30",
      format: "percent" as const,
      isLoading: forecastLoading,
    },
    {
      label: "Anomalies Detected",
      value: anomalyCount,
      trend: 0,
      comparisonText: "Spikes/Drops beyond 2.5σ",
      format: "number" as const,
      isLoading: anomaliesLoading,
    },
    {
      label: "Forecast Confidence",
      value: 80,
      trend: 0,
      comparisonText: "ARIMA Interval Bounds",
      format: "percent" as const,
      isLoading: false,
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 w-full max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-[var(--color-text-primary)]">Intelligence & Forecasting</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Timeseries modeling and automated statistical anomaly detection.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="w-full">
        <ChartCard
          title="Revenue Forecast Projection"
          subtitle="ARIMA(1,1,1) forward projection with 80% confidence bands. Automatically falls back to moving average if data lacks stationarity."
          isLoading={forecastLoading}
        >
          <div className="pt-4">
            <ForecastChart data={forecastData} />
          </div>
        </ChartCard>
      </div>

      <div className="w-full">
        <ChartCard
          title="Anomaly Detection Timeline"
          subtitle="Rolling 14-day z-score deviations identifying statistically significant revenue spikes and drops"
          isLoading={anomaliesLoading || forecastLoading}
        >
          <div className="pt-4">
            {/* Provide historical timeseries to the anomaly chart to plot the baseline */}
            <AnomalyChart timeseries={forecastData?.historical || []} anomalies={anomaliesData?.anomalies || []} />
          </div>
        </ChartCard>
      </div>

      <div className="w-full">
        <ChartCard
          title="Anomaly Intelligence Log"
          subtitle="Detailed ledger of flagged historical anomalies and generated heuristic causes"
        >
          <AnomalyLogTable data={anomaliesData?.anomalies || []} isLoading={anomaliesLoading} />
        </ChartCard>
      </div>
    </div>
  );
}
