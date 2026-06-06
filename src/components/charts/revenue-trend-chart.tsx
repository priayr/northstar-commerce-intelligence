"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";

type TrendData = {
  date: string;
  grossRevenue: number;
  netRevenue: number;
  orders: number;
};

type RevenueTrendChartProps = {
  data: {
    current: TrendData[];
    previous: TrendData[];
  };
};

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  // Combine current and previous arrays to align them by day index
  const chartData = useMemo(() => {
    if (!data?.current) return [];
    
    // We assume current and previous are ordered ascending by date.
    // We map them by index so we can overlay them easily.
    return data.current.map((curr, idx) => {
      const prev = data.previous[idx];
      return {
        date: curr.date,
        // Short date format for X axis (e.g., "Oct 12")
        label: new Date(curr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        currentRevenue: curr.netRevenue,
        previousRevenue: prev ? prev.netRevenue : 0,
        prevDate: prev?.date,
      };
    });
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
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.15} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          width={60}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: "var(--surface-0)", borderColor: "var(--border-strong)", borderRadius: "6px", fontSize: "13px" }}
          formatter={(value: number, name: string) => [formatCurrency(value), name === "currentRevenue" ? "Current" : "Previous"]}
          labelStyle={{ color: "var(--text-secondary)", marginBottom: "4px" }}
        />
        <Area 
          type="monotone" 
          dataKey="previousRevenue" 
          stroke="var(--text-muted)" 
          strokeWidth={2}
          strokeDasharray="4 4"
          fill="transparent" 
          activeDot={false}
        />
        <Area 
          type="monotone" 
          dataKey="currentRevenue" 
          stroke="var(--chart-1)" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorCurrent)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
