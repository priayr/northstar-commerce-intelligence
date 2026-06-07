"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type CohortData = {
  matrix: Record<string, Record<string, number>>;
  cohort_sizes: Record<string, number>;
};

type CohortHeatmapProps = {
  data?: CohortData;
};

export function CohortHeatmap({ data }: CohortHeatmapProps) {
  const processed = useMemo(() => {
    if (!data || !data.matrix || Object.keys(data.matrix).length === 0) return null;

    const cohorts = Object.keys(data.matrix).sort();
    
    // Find max periods
    let maxPeriods = 0;
    cohorts.forEach(c => {
      const periods = Object.keys(data.matrix[c]).map(Number);
      if (periods.length > 0) {
        maxPeriods = Math.max(maxPeriods, Math.max(...periods));
      }
    });
    
    // Build matrix arrays
    const rows = cohorts.map(cohort => {
      const cells = [];
      for (let i = 0; i <= maxPeriods; i++) {
        const val = data.matrix[cohort][i.toString()];
        cells.push(val !== undefined ? val : null);
      }
      return {
        cohort,
        size: data.cohort_sizes[cohort] || 0,
        cells
      };
    });
    
    return {
      periods: Array.from({ length: maxPeriods + 1 }, (_, i) => i),
      rows
    };
  }, [data]);

  if (!processed) {
    return <div className="flex h-full items-center justify-center text-[var(--color-text-muted)] text-sm py-12">No data available</div>;
  }

  // Calculate color opacity based on value (0 to 100)
  // Month 0 is always 100%, we want it to be distinct
  const getCellColor = (val: number | null, isMonthZero: boolean) => {
    if (val === null) return "transparent";
    if (isMonthZero) return "rgba(27, 107, 90, 0.9)"; // Deep accent
    
    // For subsequent months, scale opacity. Max typical retention is maybe 40%
    const normalized = Math.min(val / 40, 1);
    // Base color is accent, we vary opacity
    return `rgba(27, 107, 90, ${0.1 + (normalized * 0.7)})`;
  };
  
  const getTextColor = (val: number | null, isMonthZero: boolean) => {
    if (val === null) return "transparent";
    if (isMonthZero || val > 20) return "#ffffff";
    return "var(--color-text-primary)";
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-max">
        {/* Header Row */}
        <div className="flex border-b border-[var(--color-border)] pb-2 mb-2">
          <div className="w-24 text-xs font-semibold text-[var(--color-text-secondary)]">Cohort</div>
          <div className="w-16 text-xs font-semibold text-[var(--color-text-secondary)] text-right pr-4">Users</div>
          <div className="flex-1 flex gap-1">
            {processed.periods.map(p => (
              <div key={`p-${p}`} className="w-12 text-center text-xs font-medium text-[var(--color-text-secondary)]">
                M{p}
              </div>
            ))}
          </div>
        </div>
        
        {/* Data Rows */}
        <div className="flex flex-col gap-1">
          {processed.rows.map((row) => (
            <div key={row.cohort} className="flex items-center group">
              <div className="w-24 text-xs font-medium text-[var(--color-text-primary)]">
                {row.cohort}
              </div>
              <div className="w-16 text-xs text-[var(--color-text-secondary)] text-right pr-4">
                {row.size}
              </div>
              <div className="flex-1 flex gap-1">
                {row.cells.map((val, idx) => (
                  <div 
                    key={`${row.cohort}-${idx}`} 
                    className="w-12 h-8 rounded flex items-center justify-center text-xs transition-opacity hover:opacity-80 cursor-default"
                    style={{ 
                      backgroundColor: getCellColor(val, idx === 0),
                      color: getTextColor(val, idx === 0)
                    }}
                    title={val !== null ? `Month ${idx}: ${val.toFixed(1)}% retention` : "No data"}
                  >
                    {val !== null ? (idx === 0 ? "100%" : `${val.toFixed(0)}%`) : ""}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
