"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

type RuleData = {
  antecedents: string;
  consequents: string;
  support: number;
  confidence: number;
  lift: number;
};

type AssociationRulesTableProps = {
  data?: RuleData[];
  isLoading: boolean;
};

const columnHelper = createColumnHelper<RuleData>();

export function AssociationRulesTable({ data, isLoading }: AssociationRulesTableProps) {
  const columns = useMemo(() => [
    columnHelper.accessor("antecedents", {
      header: "If customer buys...",
      cell: (info) => <span className="font-medium text-[var(--color-text-primary)]">{info.getValue()}</span>,
    }),
    columnHelper.accessor("consequents", {
      header: "They also buy...",
      cell: (info) => <span className="font-medium text-[var(--color-text-primary)]">{info.getValue()}</span>,
    }),
    columnHelper.accessor("support", {
      header: () => <span title="% of total orders containing both items">Support</span>,
      cell: (info) => <span className="text-[var(--color-text-secondary)]">{info.getValue().toFixed(2)}%</span>,
    }),
    columnHelper.accessor("confidence", {
      header: () => <span title="% of times the consequent is bought when antecedent is bought">Confidence</span>,
      cell: (info) => <span className="text-[var(--color-text-secondary)]">{info.getValue().toFixed(1)}%</span>,
    }),
    columnHelper.accessor("lift", {
      header: () => <span title="How much more likely items are bought together vs independently">Lift</span>,
      cell: (info) => {
        const val = info.getValue();
        return <span className="font-semibold text-[var(--color-accent)]">{val.toFixed(2)}x</span>;
      },
    }),
    columnHelper.display({
      id: "strength",
      header: "Strength",
      cell: (info) => {
        const lift = info.row.original.lift;
        let label = "Moderate";
        let variant = "default";
        
        if (lift > 3.0) {
          label = "Strong";
          variant = "success";
        } else if (lift >= 2.0) {
          label = "Good";
          variant = "warning"; // Amber to indicate good, not necessarily bad
        }
        
        return <StatusBadge status={variant as any} label={label} />;
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
