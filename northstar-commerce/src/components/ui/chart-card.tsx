"use client";

import { cn } from "@/lib/utils";
import { ChartCardSkeleton } from "./skeleton";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  actions?: React.ReactNode;
  height?: number;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  isLoading = false,
  actions,
  height,
}: ChartCardProps) {
  if (isLoading) {
    return <ChartCardSkeleton />;
  }

  return (
    <div className={cn("card flex flex-col", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col">
          <h3 className="text-section">{title}</h3>
          {subtitle && (
            <p className="text-caption mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-1">{actions}</div>
        )}
      </div>
      <div
        className="flex-1 min-h-0"
        style={height ? { height: `${height}px` } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
