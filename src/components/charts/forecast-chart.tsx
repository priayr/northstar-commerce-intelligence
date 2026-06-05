"use client";

import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { formatCurrencyFull, formatDateShort } from "@/lib/utils";

export function ForecastChart({ data }: { data: any }) {
  if (!data || !data.historical) return null;
  
  // Combine historical and forecast
  const combined: any[] = [];
  
  data.historical.forEach((h: any) => {
    combined.push({
      date: formatDateShort(h.date),
      fullDate: h.date,
      historical: h.value,
      forecast: null,
      confidence: null,
    });
  });
  
  const lastHistorical = combined[combined.length - 1];
  
  if (data.forecast) {
    data.forecast.forEach((f: any, i: number) => {
      // Connect the lines by appending the last historical point as the start of the forecast
      if (i === 0 && lastHistorical) {
        combined.push({
          date: lastHistorical.date,
          fullDate: lastHistorical.fullDate,
          historical: null,
          forecast: lastHistorical.historical,
          confidence: [lastHistorical.historical, lastHistorical.historical]
        });
      }
      combined.push({
        date: formatDateShort(f.date),
        fullDate: f.date,
        historical: null,
        forecast: f.predicted,
        confidence: [f.lower, f.upper]
      });
    });
  }
  
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
          <Tooltip 
            contentStyle={{ backgroundColor: "var(--color-surface-0)", border: "1px solid var(--color-border)", borderRadius: "8px", color: "var(--color-text-primary)" }}
            formatter={(value: any, name: string) => {
              if (name === "confidence" && Array.isArray(value)) {
                return [`${formatCurrencyFull(value[0])} - ${formatCurrencyFull(value[1])}`, "80% Confidence"];
              }
              return [formatCurrencyFull(value), name.charAt(0).toUpperCase() + name.slice(1)];
            }}
            labelStyle={{ color: "var(--color-text-secondary)", marginBottom: "4px" }}
          />
          
          {/* Historical Area & Line */}
          <Area type="monotone" dataKey="historical" fill="var(--color-accent)" fillOpacity={0.15} stroke="none" />
          <Line type="monotone" dataKey="historical" stroke="var(--color-accent)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          
          {/* Forecast Area & Line */}
          <Area type="monotone" dataKey="confidence" fill="var(--color-accent)" fillOpacity={0.05} stroke="none" />
          <Line type="monotone" dataKey="forecast" stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          
          {lastHistorical && (
            <ReferenceLine x={lastHistorical.date} stroke="var(--color-text-secondary)" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: 'var(--color-text-secondary)', fontSize: 12 }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
