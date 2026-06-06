"use client";

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  value: number;
  size?: "sm" | "md";
}

export function TrendIndicator({ value, size = "sm" }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const iconSize = size === "sm" ? 12 : 14;
  const textClass = size === "sm" ? "text-[11px]" : "text-[13px]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium",
        textClass,
        isPositive && "text-positive",
        isNegative && "text-negative",
        isNeutral && "text-text-muted"
      )}
    >
      {isPositive && <ArrowUp size={iconSize} strokeWidth={2.5} />}
      {isNegative && <ArrowDown size={iconSize} strokeWidth={2.5} />}
      {isNeutral && <Minus size={iconSize} strokeWidth={2.5} />}
      <span>{Math.abs(value).toFixed(1)}%</span>
    </span>
  );
}
