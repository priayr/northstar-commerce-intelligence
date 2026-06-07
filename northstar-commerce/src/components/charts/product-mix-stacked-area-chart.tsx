"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { getChartColor } from "@/lib/utils";

type ProductMixStackedAreaChartProps = {
  data: {
    data: any[];
    categories: string[];
  };
};

export function ProductMixStackedAreaChart({ data }: ProductMixStackedAreaChartProps) {
  const { format: fmtCurrency, symbol } = useFormatCurrency();
  const chartData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item) => ({
      ...item,
      label: new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    }));
  }, [data]);

  if (!data?.data || data.data.length === 0) {
    return <div className="flex h-full items-center justify-center text-text-muted text-sm">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
          formatter={(value: number) => [fmtCurrency(value), ""]}
          labelStyle={{ color: "var(--color-text-secondary)", marginBottom: "4px" }}
        />
        {data.categories.map((cat, index) => (
          <Area 
            key={cat}
            type="monotone" 
            dataKey={cat} 
            stackId="1"
            stroke={getChartColor(index)} 
            strokeWidth={1}
            fill={getChartColor(index)} 
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
