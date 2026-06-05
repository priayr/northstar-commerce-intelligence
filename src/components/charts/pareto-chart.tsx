"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";

type ParetoData = {
  product: string;
  revenue: number;
  cumulativeShare: number;
};

type ParetoChartProps = {
  data: ParetoData[];
};

export function ParetoChart({ data }: ParetoChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-text-muted text-sm">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
        <XAxis 
          dataKey="product" 
          axisLine={false} 
          tickLine={false} 
          tick={false} // Hide x-axis labels because there are too many products
        />
        <YAxis 
          yAxisId="left"
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          width={60}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
          tickFormatter={(value) => `${value}%`}
          width={40}
        />
        <Tooltip 
          cursor={{ fill: "var(--color-surface-2)" }}
          contentStyle={{ backgroundColor: "var(--color-surface-0)", borderColor: "var(--color-border-strong)", borderRadius: "6px", fontSize: "13px" }}
          labelStyle={{ color: "var(--color-text-primary)", marginBottom: "4px", fontWeight: 500 }}
          formatter={(value: number, name: string) => {
            if (name === "revenue") return [formatCurrency(value), "Revenue"];
            if (name === "cumulativeShare") return [`${value.toFixed(1)}%`, "Cumulative Share"];
            return [value, name];
          }}
        />
        <Bar yAxisId="left" dataKey="revenue" fill="var(--color-chart-1)" radius={[0, 0, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.cumulativeShare <= 80 ? "var(--color-chart-1)" : "var(--color-chart-3)"} />
          ))}
        </Bar>
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="cumulativeShare" 
          stroke="var(--color-warning)" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "var(--color-warning)" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
