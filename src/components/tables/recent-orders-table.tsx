"use client";

import { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

type RecentOrder = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: "delivered" | "shipped" | "processing" | "cancelled" | "returned";
  channel: string;
};

const columnHelper = createColumnHelper<RecentOrder>();

const columns = [
  columnHelper.accessor("id", {
    header: "Order ID",
    cell: (info) => <span className="text-text-secondary text-xs uppercase">{info.getValue().slice(0, 8)}</span>,
  }),
  columnHelper.accessor("customer", {
    header: "Customer",
    cell: (info) => <span className="font-medium text-text-primary">{info.getValue()}</span>,
  }),
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => {
      const d = new Date(info.getValue());
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    },
  }),
  columnHelper.accessor("total", {
    header: "Total",
    cell: (info) => <span className="font-medium">{formatCurrency(info.getValue())}</span>,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("channel", {
    header: "Channel",
    cell: (info) => (
      <span className="capitalize text-text-secondary text-xs px-2 py-1 bg-surface-2 rounded-md">
        {info.getValue()}
      </span>
    ),
  }),
];

type RecentOrdersTableProps = {
  data?: RecentOrder[];
  isLoading: boolean;
};

export function RecentOrdersTable({ data, isLoading }: RecentOrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);

  const table = useReactTable({
    data: data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
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
    return <div className="p-8 text-center text-text-muted text-sm">No orders found</div>;
  }

  return (
    <div className="w-full flex flex-col">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider bg-surface-0/50">
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

      {/* Pagination Controls */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-xs text-text-muted">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded hover:bg-surface-2 disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded hover:bg-surface-2 disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
