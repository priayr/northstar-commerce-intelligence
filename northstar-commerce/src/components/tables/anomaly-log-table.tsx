"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { createColumnHelper, CellContext, ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/use-format-currency";

type AnomalyRow = {
  date: string;
  severity: string;
  actual: number;
  expected: number;
  deviation_pct: number;
  cause: string;
};

const columnHelper = createColumnHelper<AnomalyRow>();

export function AnomalyLogTable({ data, isLoading }: { data: AnomalyRow[], isLoading?: boolean }) {
  const { format: fmtCurrency } = useFormatCurrency();
  const columns = useMemo(() => [
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info: CellContext<AnomalyRow, string>) => <span className="font-medium text-[var(--color-text-primary)]">{formatDateShort(info.getValue())}</span>,
    }),
    columnHelper.accessor("severity", {
      header: "Severity",
      cell: (info: CellContext<AnomalyRow, string>) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${val === 'spike' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' : 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]'}`}>
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </span>
        );
      },
    }),
    columnHelper.accessor("actual", {
      header: "Actual",
      cell: (info: CellContext<AnomalyRow, number>) => <span className="text-[var(--color-text-primary)] font-medium">{fmtCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor("expected", {
      header: "Expected (Model)",
      cell: (info: CellContext<AnomalyRow, number>) => <span className="text-[var(--color-text-secondary)]">{fmtCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor("deviation_pct", {
      header: "Deviation",
      cell: (info: CellContext<AnomalyRow, number>) => {
        const val = info.getValue();
        const color = val > 0 ? "text-[var(--color-warning)]" : "text-[var(--color-negative)]";
        const sign = val > 0 ? "+" : "";
        return <span className={`font-medium ${color}`}>{sign}{val.toFixed(1)}%</span>;
      },
    }),
    columnHelper.accessor("cause", {
      header: "Heuristic Cause",
      cell: (info: CellContext<AnomalyRow, string>) => <span className="text-[var(--color-text-secondary)] italic">{info.getValue() || "Unknown anomaly"}</span>,
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [fmtCurrency]);

  return <DataTable columns={columns as ColumnDef<AnomalyRow, unknown>[]} data={data} isLoading={isLoading} />;
}
