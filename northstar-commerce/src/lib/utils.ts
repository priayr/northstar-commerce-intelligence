import { clsx, type ClassValue } from "clsx";

/**
 * Merge class names conditionally
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a number as currency — respects user's preferred currency
 */
export function formatCurrency(value: number, currency = "USD", locale = "en-US"): string {
  const absVal = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", INR: "₹" };
  const sym = symbols[currency] ?? "$";

  if (absVal >= 1_000_000) {
    return `${sign}${sym}${(absVal / 1_000_000).toFixed(1)}M`;
  }
  if (absVal >= 1_000) {
    return `${sign}${sym}${(absVal / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format as full currency (no abbreviation) — respects user's preferred currency
 */
export function formatCurrencyFull(value: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format as percentage
 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/**
 * Format as compact number (1.2K, 3.4M)
 */
export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

/**
 * Format a value based on type
 */
export function formatValue(
  value: number,
  format: "currency" | "percent" | "number"
): string {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
      return formatNumber(value);
  }
}

/**
 * Calculate percentage change between two values
 */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date as short (Jan 5)
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get date N days ago from today
 */
export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get start of today
 */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Generate chart color from index
 */
export function getChartColor(index: number): string {
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];
  return colors[index % colors.length];
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}
