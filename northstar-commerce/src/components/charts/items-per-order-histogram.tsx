"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data representing the distribution of items per order
const MOCK_HISTOGRAM_DATA = [
  { items: "1 item", orders: 4200 },
  { items: "2 items", orders: 2800 },
  { items: "3 items", orders: 1500 },
  { items: "4 items", orders: 850 },
  { items: "5 items", orders: 320 },
  { items: "6+ items", orders: 150 },
];

export function ItemsPerOrderHistogram() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={MOCK_HISTOGRAM_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
        <XAxis 
          dataKey="items" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
        />
        <Tooltip 
          cursor={{ fill: "var(--color-surface-2)" }}
          contentStyle={{ backgroundColor: "var(--color-surface-0)", borderColor: "var(--color-border-strong)", borderRadius: "6px", fontSize: "13px" }}
          formatter={(value: number) => [value, "Orders"]}
          labelStyle={{ color: "var(--color-text-primary)", marginBottom: "4px" }}
        />
        <Bar dataKey="orders" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
