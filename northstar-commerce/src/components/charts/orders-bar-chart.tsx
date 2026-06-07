"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatNumber } from "@/lib/utils";

type TrendData = {
  date: string;
  grossRevenue: number;
  netRevenue: number;
  orders: number;
};

type OrdersBarChartProps = {
  data: {
    current: TrendData[];
  };
};

export function OrdersBarChart({ data }: OrdersBarChartProps) {
  const chartData = useMemo(() => {
    if (!data?.current) return [];
    
    return data.current.map((curr) => ({
      ...curr,
      label: new Date(curr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
  }, [data]);

  if (!data?.current || data.current.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
        <XAxis 
          dataKey="label" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          minTickGap={30}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          width={40}
        />
        <Tooltip 
          cursor={{ fill: "var(--surface-2)" }}
          contentStyle={{ backgroundColor: "var(--surface-0)", borderColor: "var(--border-strong)", borderRadius: "6px", fontSize: "13px" }}
          formatter={(value: number) => [formatNumber(value), "Orders"]}
          labelStyle={{ color: "var(--text-secondary)", marginBottom: "4px" }}
        />
        <Bar dataKey="orders" fill="var(--chart-3)" radius={0} />
      </BarChart>
    </ResponsiveContainer>
  );
}
