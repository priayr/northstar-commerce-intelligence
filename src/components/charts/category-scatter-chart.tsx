"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";
import { formatCurrency, formatPercent, getChartColor } from "@/lib/utils";

type MatrixData = {
  category: string;
  revenue: number;
  growthRate: number;
  productCount: number;
};

type CategoryScatterChartProps = {
  data: MatrixData[];
};

export function CategoryScatterChart({ data }: CategoryScatterChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-text-muted text-sm">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
        <XAxis 
          type="number" 
          dataKey="revenue" 
          name="Revenue" 
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          type="number" 
          dataKey="growthRate" 
          name="Growth" 
          tickFormatter={(value) => `${value.toFixed(0)}%`} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <ZAxis 
          type="number" 
          dataKey="productCount" 
          range={[100, 1000]} // Min/Max bubble size
          name="Products" 
        />
        <Tooltip 
          cursor={{ strokeDasharray: "3 3" }} 
          contentStyle={{ backgroundColor: "var(--color-surface-0)", borderColor: "var(--color-border-strong)", borderRadius: "6px", fontSize: "13px" }}
          formatter={(value: number, name: string) => {
            if (name === "Revenue") return [formatCurrency(value), name];
            if (name === "Growth") return [formatPercent(value), name];
            return [value, name];
          }}
          labelFormatter={() => ""}
        />
        <Scatter data={data} fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getChartColor(index)} fillOpacity={0.8} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
