"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

type ProductData = {
  id: string;
  product: string;
  sku: string;
  category: string;
  revenue: number;
  units: number;
  margin: number;
  returnRate: number;
  repeatPurchaseRate: number;
  abcClass: "A" | "B" | "C";
  isActive: boolean;
};

type ProductPerformanceTableProps = {
  data?: ProductData[];
  isLoading: boolean;
};

const columnHelper = createColumnHelper<ProductData>();

export function ProductPerformanceTable({ data, isLoading }: ProductPerformanceTableProps) {
  const columns = useMemo(() => [
    columnHelper.accessor("product", {
      header: "Product",
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-text-primary)]">{info.getValue()}</span>
          <span className="text-xs text-[var(--color-text-muted)]">{info.row.original.sku}</span>
        </div>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => <span className="text-[var(--color-text-secondary)]">{info.getValue()}</span>,
    }),
    columnHelper.accessor("revenue", {
      header: "Revenue",
      cell: (info) => <span className="font-medium">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor("units", {
      header: "Units",
      cell: (info) => formatNumber(info.getValue()),
    }),
    columnHelper.accessor("margin", {
      header: "Margin Proxy",
      cell: (info) => {
        const val = info.getValue() * 100; // Assuming DB stores as 0.x
        return <span>{val.toFixed(1)}%</span>;
      },
    }),
    columnHelper.accessor("returnRate", {
      header: "Return Rate",
      cell: (info) => {
        const val = info.getValue() * 100;
        const colorClass = val > 10 ? "text-[var(--color-negative)]" : val > 5 ? "text-[var(--color-warning)]" : "text-[var(--color-positive)]";
        return <span className={colorClass}>{val.toFixed(1)}%</span>;
      },
    }),
    columnHelper.accessor("repeatPurchaseRate", {
      header: "Repeat Purchase %",
      cell: (info) => <span>{(info.getValue() * 100).toFixed(1)}%</span>,
    }),
    columnHelper.accessor("abcClass", {
      header: "ABC Class",
      cell: (info) => {
        const val = info.getValue();
        const variant = val === "A" ? "success" : val === "B" ? "warning" : "default";
        return <StatusBadge status={variant as any} label={`Class ${val}`} />;
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
