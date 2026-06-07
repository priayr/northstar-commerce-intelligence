"use client";

import { cn } from "@/lib/utils";

type Status =
  | "delivered"
  | "shipped"
  | "processing"
  | "cancelled"
  | "returned"
  | "pending"
  | "approved"
  | "rejected"
  | "refunded";

const statusStyles: Record<Status, { bg: string; text: string; label: string }> = {
  delivered: {
    bg: "bg-[#E8F5E9]",
    text: "text-[#2E7D32]",
    label: "Delivered",
  },
  shipped: {
    bg: "bg-[#E3F2FD]",
    text: "text-[#1565C0]",
    label: "Shipped",
  },
  processing: {
    bg: "bg-[#FFF8E1]",
    text: "text-[#F57F17]",
    label: "Processing",
  },
  cancelled: {
    bg: "bg-[#FCEAEA]",
    text: "text-[#C4362C]",
    label: "Cancelled",
  },
  returned: {
    bg: "bg-[#F3E8F9]",
    text: "text-[#7B1FA2]",
    label: "Returned",
  },
  pending: {
    bg: "bg-[#FFF8E1]",
    text: "text-[#F57F17]",
    label: "Pending",
  },
  approved: {
    bg: "bg-[#E8F5E9]",
    text: "text-[#2E7D32]",
    label: "Approved",
  },
  rejected: {
    bg: "bg-[#FCEAEA]",
    text: "text-[#C4362C]",
    label: "Rejected",
  },
  refunded: {
    bg: "bg-[#E3F2FD]",
    text: "text-[#1565C0]",
    label: "Refunded",
  },
};

// Dark mode overrides via CSS custom properties
const darkStatusStyles: Record<Status, { bg: string; text: string }> = {
  delivered: { bg: "[data-theme=dark]_&:bg-[#1B3A20]", text: "[data-theme=dark]_&:text-[#81C784]" },
  shipped: { bg: "[data-theme=dark]_&:bg-[#152840]", text: "[data-theme=dark]_&:text-[#64B5F6]" },
  processing: { bg: "[data-theme=dark]_&:bg-[#3A2F10]", text: "[data-theme=dark]_&:text-[#FFD54F]" },
  cancelled: { bg: "[data-theme=dark]_&:bg-[#3A1515]", text: "[data-theme=dark]_&:text-[#EF9A9A]" },
  returned: { bg: "[data-theme=dark]_&:bg-[#2A1540]", text: "[data-theme=dark]_&:text-[#CE93D8]" },
  pending: { bg: "[data-theme=dark]_&:bg-[#3A2F10]", text: "[data-theme=dark]_&:text-[#FFD54F]" },
  approved: { bg: "[data-theme=dark]_&:bg-[#1B3A20]", text: "[data-theme=dark]_&:text-[#81C784]" },
  rejected: { bg: "[data-theme=dark]_&:bg-[#3A1515]", text: "[data-theme=dark]_&:text-[#EF9A9A]" },
  refunded: { bg: "[data-theme=dark]_&:bg-[#152840]", text: "[data-theme=dark]_&:text-[#64B5F6]" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.processing;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium leading-none whitespace-nowrap",
        style.bg,
        style.text,
        className
      )}
    >
      {style.label}
    </span>
  );
}
