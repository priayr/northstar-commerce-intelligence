"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";

type RFMData = {
  customer_id: string;
  R: number;
  F: number;
  M: number;
  rfm_score: string;
  segment: string;
};

type SegmentSummary = {
  segment: string;
  count: number;
  avgRevenue: number;
  avgOrders: number;
  avgRecency: number;
  actionLabel: string;
};

type CustomerSegmentTableProps = {
  data?: RFMData[];
  isLoading: boolean;
};

const columnHelper = createColumnHelper<SegmentSummary>();

const ACTION_LABELS: Record<string, string> = {
  "Champions": "Reward & Upsell",
  "Loyal": "Cross-sell",
  "Potential": "Nurture & Recommend",
  "New": "Onboard & Educate",
  "At Risk": "Send Win-back offer",
  "Lost": "Ignore or Reactivate",
};

export function CustomerSegmentTable({ data, isLoading }: CustomerSegmentTableProps) {
  const tableData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const groups: Record<string, { count: number; totalM: number; totalF: number; totalR: number }> = {};
    
    data.forEach(row => {
      if (!groups[row.segment]) {
        groups[row.segment] = { count: 0, totalM: 0, totalF: 0, totalR: 0 };
      }
      groups[row.segment].count += 1;
      groups[row.segment].totalM += row.M;
      groups[row.segment].totalF += row.F;
      groups[row.segment].totalR += row.R;
    });
    
    return Object.entries(groups).map(([segment, agg]) => ({
      segment,
      count: agg.count,
      avgRevenue: agg.totalM / agg.count,
      avgOrders: agg.totalF / agg.count,
      avgRecency: agg.totalR / agg.count,
      actionLabel: ACTION_LABELS[segment] || "Monitor"
    })).sort((a, b) => b.avgRevenue - a.avgRevenue);
  }, [data]);

  const { format: fmtCurrency } = useFormatCurrency();
  const columns = useMemo(() => [
    columnHelper.accessor("segment", {
      header: "Segment",
      cell: (info) => <span className="font-semibold text-[var(--color-text-primary)]">{info.getValue()}</span>,
    }),
    columnHelper.accessor("count", {
      header: "Customers",
      cell: (info) => formatNumber(info.getValue()),
    }),
    columnHelper.accessor("avgRevenue", {
      header: "Avg Revenue",
      cell: (info) => <span className="font-medium">{fmtCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor("avgOrders", {
      header: "Avg Orders",
      cell: (info) => info.getValue().toFixed(1),
    }),
    columnHelper.accessor("avgRecency", {
      header: "Avg Recency (Days)",
      cell: (info) => info.getValue().toFixed(0),
    }),
    columnHelper.accessor("actionLabel", {
      header: "Action Strategy",
      cell: (info) => <span className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider font-medium">{info.getValue()}</span>,
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [fmtCurrency]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return <DataTable columns={columns as ColumnDef<SegmentSummary, unknown>[]} data={tableData} />;
}
