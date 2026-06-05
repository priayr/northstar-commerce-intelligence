/* ──────────────────────────────────────────────────────────
   Northstar Commerce Intelligence — Constants
   ────────────────────────────────────────────────────────── */

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const CHART_COLORS_HEX = {
  light: ["#1B6B5A", "#3B82A0", "#D4764E", "#7C6CA8", "#5A8F6B"],
  dark: ["#3D9B8A", "#5BA3BE", "#E09070", "#9A8CC0", "#72B085"],
} as const;

export const STATUS_MAP = {
  delivered: { label: "Delivered", color: "#2E7D32" },
  shipped: { label: "Shipped", color: "#1565C0" },
  processing: { label: "Processing", color: "#F57F17" },
  cancelled: { label: "Cancelled", color: "#C4362C" },
  returned: { label: "Returned", color: "#7B1FA2" },
} as const;

export const CATEGORIES = [
  "Electronics",
  "Apparel",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Food & Beverage",
] as const;

export const REGIONS = [
  "California",
  "New York",
  "Texas",
  "Florida",
  "Illinois",
  "Washington",
  "Pennsylvania",
  "Ohio",
  "Georgia",
  "North Carolina",
  "United Kingdom",
  "Canada",
] as const;

export const CHANNELS = [
  "Organic",
  "Paid",
  "Email",
  "Social",
  "Direct",
] as const;

export const RFM_SEGMENTS = [
  "Champions",
  "Loyal",
  "Recent",
  "Promising",
  "Needs Attention",
  "At Risk",
  "Can't Lose",
  "Hibernating",
] as const;

export const PAYMENT_METHODS = [
  { value: "card", label: "Credit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "bank_transfer", label: "Bank Transfer" },
] as const;

export const RETURN_REASONS = [
  "Wrong size",
  "Defective",
  "Not as described",
  "Changed mind",
  "Late delivery",
] as const;
