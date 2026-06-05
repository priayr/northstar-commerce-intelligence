"use client";

import { cn } from "@/lib/utils";
import { InboxIcon, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center",
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-surface-2 mb-4">
        <Icon size={20} className="text-text-muted" strokeWidth={1.5} />
      </div>
      <h3 className="text-section mb-1">{title}</h3>
      <p
        className="text-caption max-w-[45ch] mb-4"
        style={{ textWrap: "balance" }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-medium",
            "bg-accent text-white",
            "hover:bg-accent-hover",
            "transition-colors-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          )}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
