"use client";

import { ResponsiveContainer, ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from "recharts";
import { formatCurrencyFull, formatDateShort } from "@/lib/utils";

export function AnomalyChart({ timeseries, anomalies }: { timeseries: any[], anomalies: any[] }) {
  if (!timeseries || timeseries.length === 0) return null;
  
  // Combine timeseries with anomalies for the scatter plot
  const anomalyMap = new Map(anomalies.map(a => [a.date, a]));
  
  const combined = timeseries.map(t => {
    const isAnomaly = anomalyMap.get(t.date);
    return {
      date: formatDateShort(t.date),
      fullDate: t.date,
      actual: t.revenue || t.value || 0,
      spike: isAnomaly?.severity === "spike" ? t.revenue || t.value || 0 : null,
      drop: isAnomaly?.severity === "drop" ? t.revenue || t.value || 0 : null,
      anomalyData: isAnomaly
    };
  });
  
  return (
    <div className="w-full h-full min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={combined} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} 
            dy={10} 
            minTickGap={30}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} 
            tickFormatter={(val) => `$${(val / 1000)}k`} 
            dx={-10}
          />
          <ZAxis range={[60, 60]} />
          <Tooltip 
            contentStyle={{ backgroundColor: "var(--color-surface-0)", border: "1px solid var(--color-border)", borderRadius: "8px", color: "var(--color-text-primary)", zIndex: 100 }}
            cursor={{ stroke: 'var(--color-border-strong)', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const anomaly = data.anomalyData;
                
                return (
                  <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">{label}</p>
                    <p className="text-sm text-[var(--color-text-primary)]">
                      <span className="font-semibold">Actual: </span>{formatCurrencyFull(data.actual)}
                    </p>
                    {anomaly && (
                      <>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          <span className="font-semibold">Expected: </span>{formatCurrencyFull(anomaly.expected)}
                        </p>
                        <p className={`text-sm mt-1 font-semibold ${anomaly.severity === "spike" ? "text-[var(--color-warning)]" : "text-[var(--color-negative)]"}`}>
                          {anomaly.severity === "spike" ? "+" : ""}{anomaly.deviation_pct.toFixed(1)}% Deviation
                        </p>
                      </>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Line type="monotone" dataKey="actual" stroke="var(--color-accent)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          
          {/* Plot spikes and drops over the line */}
          <Scatter dataKey="spike" fill="var(--color-warning)" />
          <Scatter dataKey="drop" fill="var(--color-negative)" />
          
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
