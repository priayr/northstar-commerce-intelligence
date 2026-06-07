"use client";

import { useState, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { formatNumber, formatPercent } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type TopProduct = {
  product: string;
  category: string;
  revenue: number;
  units: number;
  returnRate: number;
  trend: number[];
};

const columnHelper = createColumnHelper<TopProduct>();

type TopProductsTableProps = {
  data?: TopProduct[];
  isLoading: boolean;
};

export function TopProductsTable({ data, isLoading }: TopProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "revenue", desc: true },
  ]);
  const { format: fmtCurrency } = useFormatCurrency();

  const columns = useMemo(() => [
    columnHelper.accessor("product", {
      header: "Product",
      cell: (info) => <span className="font-medium text-text-primary">{info.getValue()}</span>,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
    }),
    columnHelper.accessor("revenue", {
      header: "Revenue",
      cell: (info) => <span className="font-medium">{fmtCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor("units", {
      header: "Units",
      cell: (info) => formatNumber(info.getValue()),
    }),
    columnHelper.accessor("returnRate", {
      header: "Return Rate",
      cell: (info) => {
        const val = info.getValue();
        const colorClass = val > 10 ? "text-negative" : val > 5 ? "text-warning" : "text-positive";
        return <span className={colorClass}>{formatPercent(val)}</span>;
      },
    }),
    columnHelper.accessor("trend", {
      header: "Trend",
      cell: (info) => {
        const vals = info.getValue();
        if (!vals || vals.length === 0) return null;
        // Simple SVG sparkline
        const max = Math.max(...vals);
        const min = Math.min(...vals);
        const range = max - min || 1;
        const points = vals.map((v, i) => {
          const x = (i / (vals.length - 1)) * 40;
          const y = 20 - ((v - min) / range) * 20;
          return `${x},${y}`;
        }).join(" ");

        const isPositive = vals[vals.length - 1] >= vals[0];
        const color = isPositive ? "var(--positive)" : "var(--negative)";

        return (
          <svg width="40" height="20" className="overflow-visible">
            <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
          </svg>
        );
      },
      enableSorting: false,
    }),
  ], [fmtCurrency]);

  const table = useReactTable({
    data: data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="text" className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-text-muted text-sm">No products found</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {headerGroup.headers.map((header) => (
                <th 
                  key={header.id} 
                  className={`px-4 py-3 ${header.column.getCanSort() ? "cursor-pointer select-none group" : ""}`}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="text-sm">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border/50 hover:bg-surface-2 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
