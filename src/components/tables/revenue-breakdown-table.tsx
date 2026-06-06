"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";

type BreakdownData = {
  category: string;
  gross: number;
  net: number;
  discount: number;
  returns: number;
  netPercent: number;
  delta: number;
};

type RevenueBreakdownTableProps = {
  data?: BreakdownData[];
  isLoading: boolean;
};

const columnHelper = createColumnHelper<BreakdownData>();

export function RevenueBreakdownTable({ data, isLoading }: RevenueBreakdownTableProps) {
  const columns = useMemo(() => [
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => <span className="font-medium text-[var(--color-text-primary)]">{info.getValue()}</span>,
    }),
    columnHelper.accessor("gross", {
      header: "Gross Revenue",
      cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor("net", {
      header: "Net Revenue",
      cell: (info) => <span className="font-medium">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor("discount", {
      header: "Discount $",
      cell: (info) => <span className="text-[var(--color-text-secondary)]">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor("returns", {
      header: "Return $",
      cell: (info) => {
        const val = info.getValue();
        return <span className={val > 0 ? "text-[var(--color-negative)]" : "text-[var(--color-text-secondary)]"}>{formatCurrency(val)}</span>;
      },
    }),
    columnHelper.accessor("netPercent", {
      header: "Net %",
      cell: (info) => {
        const val = info.getValue();
        const colorClass = val < 80 ? "text-[var(--color-negative)]" : val < 90 ? "text-[var(--color-warning)]" : "text-[var(--color-positive)]";
        return <span className={colorClass}>{val.toFixed(1)}%</span>;
      },
    }),
    columnHelper.accessor("delta", {
      header: "Delta",
      cell: (info) => {
        const val = info.getValue();
        const colorClass = val < 0 ? "text-[var(--color-negative)]" : val > 0 ? "text-[var(--color-positive)]" : "text-[var(--color-text-secondary)]";
        return <span className={colorClass}>{formatPercent(val)}</span>;
      },
    }),
  ], []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return <DataTable columns={columns} data={data || []} />;
}
