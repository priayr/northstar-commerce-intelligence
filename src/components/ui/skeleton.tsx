"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "heading" | "kpi" | "chart" | "circle";
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({
  variant = "text",
  className,
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: "h-[1em] w-full",
    heading: "h-[1.5em] w-[40%]",
    kpi: "h-[80px] w-full",
    chart: "h-[300px] w-full",
    circle: "h-8 w-8 rounded-full",
  };

  return (
    <div
      className={cn("skeleton", variantClasses[variant], className)}
      style={{
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      }}
    />
  );
}

/**
 * Multiple skeleton lines for simulating text blocks
 */
export function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === count - 1 ? "w-[60%]" : "w-full"}
        />
      ))}
    </div>
  );
}

/**
 * KPI card skeleton
 */
export function KPICardSkeleton() {
  return (
    <div className="card flex flex-col gap-3">
      <Skeleton variant="text" className="h-3 w-24" />
      <Skeleton variant="text" className="h-8 w-32" />
      <div className="flex items-center gap-2">
        <Skeleton variant="text" className="h-3 w-12" />
        <Skeleton variant="text" className="h-3 w-20" />
      </div>
    </div>
  );
}

/**
 * Chart card skeleton
 */
export function ChartCardSkeleton() {
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-4 w-32" />
        <Skeleton variant="text" className="h-4 w-16" />
      </div>
      <Skeleton variant="chart" />
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div
        className="grid gap-4 px-4 py-3 border-b border-border"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`h-${i}`} variant="text" className="h-3 w-20" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={`r-${r}`}
          className="grid gap-4 px-4 py-3 border-b border-border"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={`r-${r}-c-${c}`}
              variant="text"
              className={cn("h-3", c === 0 ? "w-32" : "w-16")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
