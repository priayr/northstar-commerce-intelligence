"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useFormatCurrency } from "@/hooks/use-format-currency";

type CategoryData = {
  category: string;
  revenue: number;
  share: number;
};

type CategoryBarChartProps = {
  data: CategoryData[];
};

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const { format: fmtCurrency, symbol } = useFormatCurrency();
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        No data available
      </div>
    );
  }

  // Use top 8
  const displayData = data.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={displayData}
        layout="vertical"
        margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.3} />
        <XAxis 
          type="number" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          tickFormatter={(value) => `${symbol}${(value / 1000).toFixed(0)}k`}
        />
        <YAxis 
          dataKey="category" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          width={100}
        />
        <Tooltip 
          cursor={{ fill: "var(--surface-2)" }}
          contentStyle={{ backgroundColor: "var(--surface-0)", borderColor: "var(--border-strong)", borderRadius: "6px", fontSize: "13px" }}
          formatter={(value: number) => [fmtCurrency(value), "Revenue"]}
          labelStyle={{ color: "var(--text-secondary)", marginBottom: "4px" }}
        />
        <Bar dataKey="revenue" radius={0} barSize={24}>
          {displayData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? "var(--chart-1)" : "var(--chart-2)"} opacity={index === 0 ? 1 : 0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
