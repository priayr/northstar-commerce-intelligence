"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import { formatCurrency, formatDateShort } from "@/lib/utils";

const columnHelper = createColumnHelper<any>();

export function AnomalyLogTable({ data, isLoading }: { data: any[], isLoading?: boolean }) {
  const columns = useMemo(() => [
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => <span className="font-medium text-[var(--color-text-primary)]">{formatDateShort(info.getValue())}</span>,
    } as any),
    columnHelper.accessor("severity", {
      header: "Severity",
      cell: (info) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${val === 'spike' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' : 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]'}`}>
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </span>
        );
      },
    } as any),
    columnHelper.accessor("actual", {
      header: "Actual",
      cell: (info) => <span className="text-[var(--color-text-primary)] font-medium">{formatCurrency(info.getValue())}</span>,
    } as any),
    columnHelper.accessor("expected", {
      header: "Expected (Model)",
      cell: (info) => <span className="text-[var(--color-text-secondary)]">{formatCurrency(info.getValue())}</span>,
    } as any),
    columnHelper.accessor("deviation_pct", {
      header: "Deviation",
      cell: (info) => {
        const val = info.getValue();
        const color = val > 0 ? "text-[var(--color-warning)]" : "text-[var(--color-negative)]";
        const sign = val > 0 ? "+" : "";
        return <span className={`font-medium ${color}`}>{sign}{val.toFixed(1)}%</span>;
      },
    } as any),
    columnHelper.accessor("cause", {
      header: "Heuristic Cause",
      cell: (info) => <span className="text-[var(--color-text-secondary)] italic">{info.getValue() || "Unknown anomaly"}</span>,
    } as any),
  ], []);

  return <DataTable columns={columns as any} data={data} isLoading={isLoading} />;
}
