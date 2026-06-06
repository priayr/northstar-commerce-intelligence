"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";

type ChannelData = {
  name: string;
  value: number;
};

type ChannelDonutChartProps = {
  data: ChannelData[];
};

export function ChannelDonutChart({ data }: ChannelDonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        No data available
      </div>
    );
  }

  // Capitalize channel names
  const formattedData = data.map(d => ({
    ...d,
    name: d.name.charAt(0).toUpperCase() + d.name.slice(1)
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="45%"
          innerRadius="60%"
          outerRadius="80%"
          paddingAngle={2}
          dataKey="value"
          stroke="var(--surface-1)"
          strokeWidth={2}
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: "var(--surface-0)", borderColor: "var(--border-strong)", borderRadius: "6px", fontSize: "13px" }}
          formatter={(value: number) => formatCurrency(value)}
          itemStyle={{ color: "var(--text-primary)" }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", color: "var(--text-secondary)", paddingTop: "10px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
