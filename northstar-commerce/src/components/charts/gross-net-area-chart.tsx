"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFormatCurrency } from "@/hooks/use-format-currency";

type TrendData = {
  date: string;
  grossRevenue: number;
  netRevenue: number;
  orders: number;
};

type GrossNetAreaChartProps = {
  data: {
    current: TrendData[];
    previous: TrendData[];
  };
};

export function GrossNetAreaChart({ data }: GrossNetAreaChartProps) {
  const { format: fmtCurrency, symbol } = useFormatCurrency();
  const chartData = useMemo(() => {
    if (!data?.current) return [];
    return data.current.map((curr) => ({
      date: curr.date,
      label: new Date(curr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      grossRevenue: curr.grossRevenue,
      netRevenue: curr.netRevenue,
    }));
  }, [data]);

  if (!data?.current || data.current.length === 0) {
    return <div className="flex h-full items-center justify-center text-text-muted text-sm">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.15} />
            <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.15} />
            <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
        <XAxis 
          dataKey="label" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
          minTickGap={30}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
          tickFormatter={(value) => `${symbol}${(value / 1000).toFixed(0)}k`}
          width={60}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: "var(--color-surface-0)", borderColor: "var(--color-border-strong)", borderRadius: "6px", fontSize: "13px" }}
          formatter={(value: number, name: string) => [fmtCurrency(value), name === "grossRevenue" ? "Gross Revenue" : "Net Revenue"]}
          labelStyle={{ color: "var(--color-text-secondary)", marginBottom: "4px" }}
        />
        <Area 
          type="monotone" 
          dataKey="grossRevenue" 
          stroke="var(--color-warning)" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorGross)" 
        />
        <Area 
          type="monotone" 
          dataKey="netRevenue" 
          stroke="var(--color-accent)" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorNet)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
