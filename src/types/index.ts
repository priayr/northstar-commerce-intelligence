/* ──────────────────────────────────────────────────────────
   Northstar Commerce Intelligence — Type Definitions
   ────────────────────────────────────────────────────────── */

// ─── Database Models ───

export interface Customer {
  id: string;
  name: string;
  email: string;
  segment: string;
  region: string;
  acquisitionChannel: string;
  firstOrderDate: Date | null;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  sku: string;
  costPrice: number;
  retailPrice: number;
  brand: string;
  weight: number;
  isActive: boolean;
  category?: Category;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  channel: string;
  region: string;
  subtotal: number;
  discountAmount: number;
  tax: number;
  shippingCost: number;
  total: number;
  orderDate: Date;
  shippedDate: Date | null;
  deliveredDate: Date | null;
  customer?: Customer;
  items?: OrderItem[];
}

export type OrderStatus =
  | "delivered"
  | "shipped"
  | "processing"
  | "cancelled"
  | "returned";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
  product?: Product;
  returnRecord?: Return;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: string;
  amount: number;
  paidAt: Date;
}

export type PaymentMethod = "card" | "paypal" | "bank_transfer";

export interface Return {
  id: string;
  orderItemId: string;
  reason: string;
  status: ReturnStatus;
  refundAmount: number;
  initiatedAt: Date;
  resolvedAt: Date | null;
}

export type ReturnStatus = "pending" | "approved" | "rejected" | "refunded";

export interface Session {
  id: string;
  customerId: string | null;
  device: string;
  browser: string;
  channel: string;
  pagesViewed: number;
  addedToCart: boolean;
  reachedCheckout: boolean;
  converted: boolean;
  startedAt: Date;
}

export interface Region {
  id: string;
  name: string;
  country: string;
  zone: string;
  avgShippingDays: number;
}

// ─── Computed / Aggregated ───

export interface DailyMetric {
  id: string;
  date: Date;
  revenue: number;
  netRevenue: number;
  orders: number;
  unitsSold: number;
  aov: number;
  refundAmount: number;
  newCustomers: number;
  returningCustomers: number;
  discountTotal: number;
}

export interface ProductPerformance {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  totalRevenue: number;
  totalQuantity: number;
  returnCount: number;
  returnRate: number;
  marginProxy: number;
  repeatPurchaseRate: number;
  avgDiscount: number;
}

export interface CustomerMetric {
  id: string;
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
  daysSinceLastOrder: number;
  rfmRecency: number;
  rfmFrequency: number;
  rfmMonetary: number;
  segment: string;
}

// ─── UI Types ───

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

export type DatePreset = "7d" | "30d" | "90d" | "12m" | "custom";

export interface KPIData {
  label: string;
  value: number;
  previousValue: number;
  format: "currency" | "percent" | "number";
  trend: number; // percentage change
  comparisonText: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  previousValue?: number;
  label?: string;
}

export interface FilterState {
  dateRange: DateRange;
  datePreset: DatePreset;
  selectedCategories: string[];
  selectedRegions: string[];
  selectedChannels: string[];
  comparisonPeriod: "previous" | "yoy";
}

// ─── Navigation ───

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}
