"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getChartColor } from "@/lib/utils";

type RuleData = {
  antecedents: string;
  consequents: string;
  lift: number;
};

type AssociationBarChartProps = {
  data?: RuleData[];
};

export function AssociationBarChart({ data }: AssociationBarChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .sort((a, b) => b.lift - a.lift)
      .slice(0, 20)
      .map(d => ({
        name: `${d.antecedents} → ${d.consequents}`,
        lift: d.lift,
      }));
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-[var(--color-text-muted)] text-sm">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" opacity={0.3} />
        <XAxis 
          type="number" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={false} // Hide labels on Y-axis because they are too long
          width={10}
        />
        <Tooltip 
          cursor={{ fill: "var(--color-surface-2)" }}
          contentStyle={{ backgroundColor: "var(--color-surface-0)", borderColor: "var(--color-border-strong)", borderRadius: "6px", fontSize: "13px" }}
          formatter={(value: number) => [`${value.toFixed(2)}x`, "Lift"]}
          labelStyle={{ color: "var(--color-text-primary)", marginBottom: "4px" }}
        />
        <Bar dataKey="lift" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getChartColor(index)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
