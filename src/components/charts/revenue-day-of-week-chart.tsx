"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

type TrendData = {
  date: string;
  grossRevenue: number;
  netRevenue: number;
  orders: number;
};

type RevenueDayOfWeekChartProps = {
  data: {
    current: TrendData[];
    previous: TrendData[];
  };
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DISPLAY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function RevenueDayOfWeekChart({ data }: RevenueDayOfWeekChartProps) {
  const chartData = useMemo(() => {
    if (!data?.current || data.current.length === 0) return [];
    
    const dayTotals = new Array(7).fill(0);
    
    data.current.forEach(item => {
      const date = new Date(item.date);
      // getDay() returns 0 for Sunday, 1 for Monday...
      const day = date.getDay();
      // We want Monday=0, Sunday=6
      const mappedDay = day === 0 ? 6 : day - 1;
      dayTotals[mappedDay] += item.netRevenue;
    });

    return DISPLAY_DAYS.map((dayName, index) => ({
      day: dayName,
      revenue: dayTotals[index],
    }));
  }, [data]);

  if (!data?.current || data.current.length === 0) {
    return <div className="flex h-full items-center justify-center text-text-muted text-sm">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
        <XAxis 
          dataKey="day" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          width={60}
        />
        <Tooltip 
          cursor={{ fill: "var(--color-surface-2)" }}
          contentStyle={{ backgroundColor: "var(--color-surface-0)", borderColor: "var(--color-border-strong)", borderRadius: "6px", fontSize: "13px" }}
          formatter={(value: number) => [formatCurrency(value), "Net Revenue"]}
          labelStyle={{ color: "var(--color-text-secondary)", marginBottom: "4px" }}
        />
        <Bar 
          dataKey="revenue" 
          fill="var(--color-chart-2)" 
          radius={[0, 0, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
