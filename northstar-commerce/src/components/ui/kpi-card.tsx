"use client";

import { cn, formatPercent } from "@/lib/utils";
import { TrendIndicator } from "./trend-indicator";
import { useFormatCurrency } from "@/hooks/use-format-currency";

interface KPICardProps {
  label: string;
  value: number;
  trend: number;
  comparisonText: string;
  format: "currency" | "percent" | "number";
  isLoading?: boolean;
  tooltip?: string;
}

export function KPICard({
  label,
  value,
  trend,
  comparisonText,
  format,
  isLoading = false,
  tooltip,
}: KPICardProps) {
  const { formatKPI } = useFormatCurrency();

  if (isLoading) {
    return (
      <div className="card flex flex-col gap-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-8 w-32" />
        <div className="flex items-center gap-2">
          <div className="skeleton h-3 w-12" />
          <div className="skeleton h-3 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="card flex flex-col gap-1.5 transition-colors-fast h-full">
      <span
        className="text-kpi-label cursor-help border-b border-dashed border-[var(--color-border-strong)] w-fit"
        title={tooltip || label}
      >
        {label}
      </span>
      <span className="text-kpi-value">{formatKPI(value, format)}</span>
      <div className="flex items-center gap-2 mt-0.5">
        <TrendIndicator value={trend} size="sm" />
        <span className="text-caption">{comparisonText}</span>
      </div>
    </div>
  );
}
