"use client";

import { useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber } from "@/lib/utils";

type RFMData = {
  customer_id: string;
  R: number;
  F: number;
  M: number;
  rfm_score: string;
  segment: string;
};

type RFMTreemapProps = {
  data?: RFMData[];
};

const SEGMENT_COLORS: Record<string, string> = {
  "Champions": "var(--color-accent)",
  "Loyal": "var(--color-chart-2)",
  "Potential": "var(--color-chart-4)",
  "New": "var(--color-chart-5)",
  "At Risk": "var(--color-warning)",
  "Lost": "var(--color-negative)",
};

const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;
  
  if (depth === 1) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: SEGMENT_COLORS[name] || "var(--color-surface-2)",
            stroke: "var(--color-surface-0)",
            strokeWidth: 2,
            strokeOpacity: 1,
            opacity: 0.85
          }}
        />
        {width > 50 && height > 30 && (
          <>
            <text x={x + 8} y={y + 18} fill="#fff" fontSize={13} fontWeight={600}>
              {name}
            </text>
            <text x={x + 8} y={y + 34} fill="#fff" fontSize={11} fillOpacity={0.8}>
              {formatNumber(props.value)} users
            </text>
          </>
        )}
      </g>
    );
  }
  return null;
};

export function RFMTreemap({ data }: RFMTreemapProps) {
  const treeData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group by segment
    const grouped: Record<string, number> = {};
    data.forEach(row => {
      grouped[row.segment] = (grouped[row.segment] || 0) + 1;
    });
    
    // Format for Recharts Treemap
    return [
      {
        name: "RFM",
        children: Object.entries(grouped).map(([name, size]) => ({ name, size }))
      }
    ];
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-[var(--color-text-muted)] text-sm">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={treeData}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#fff"
        content={<CustomizedContent />}
        isAnimationActive={false}
      >
        <Tooltip 
          contentStyle={{ backgroundColor: "var(--color-surface-0)", borderColor: "var(--color-border-strong)", borderRadius: "6px", fontSize: "13px" }}
          formatter={(value: number) => [formatNumber(value), "Customers"]}
          labelFormatter={(label) => ""}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
