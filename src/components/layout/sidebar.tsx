"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/filters";
import {
  LayoutDashboard,
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  Database,
  Settings,
  PanelLeftClose,
  PanelLeft,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Revenue", href: "/revenue", icon: DollarSign },
  { label: "Products", href: "/products", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Basket", href: "/basket", icon: ShoppingBag },
  { label: "Forecasts", href: "/forecasts", icon: TrendingUp },
  { label: "Data Studio", href: "/data-studio", icon: Database },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-surface-1 border-r border-border transition-all duration-200 ease-in-out flex-shrink-0",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      {/* Logo / Brand */}
      <div className={cn(
        "flex items-center h-[52px] px-4 border-b border-border flex-shrink-0",
        collapsed && "justify-center px-0"
      )}>
        {collapsed ? (
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
            <span className="text-white text-[12px] font-bold tracking-tight">N</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[12px] font-bold tracking-tight">N</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-text-primary leading-tight tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Northstar
              </span>
              <span className="text-[10px] text-text-muted leading-tight tracking-wide uppercase">
                Commerce Intel
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md transition-colors-fast",
                  collapsed ? "justify-center px-0 py-2.5 mx-auto w-10 h-10" : "px-3 py-2",
                  isActive
                    ? "bg-accent-subtle text-accent"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.5}
                  className="flex-shrink-0"
                />
                {!collapsed && (
                  <span className="text-nav truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-1 border-t border-border">
        <button
          onClick={toggle}
          className={cn(
            "flex items-center gap-2.5 w-full rounded-md py-2 text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors-fast",
            collapsed ? "justify-center px-0" : "px-3"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft size={16} strokeWidth={1.5} />
          ) : (
            <>
              <PanelLeftClose size={16} strokeWidth={1.5} />
              <span className="text-[12px]">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User / Demo mode */}
      <div className={cn(
        "flex items-center gap-2.5 px-4 py-3 border-t border-border",
        collapsed && "justify-center px-0"
      )}>
        <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-text-muted" strokeWidth={1.5} />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-medium text-text-primary truncate">
              Analyst
            </span>
            <span className="text-[10px] text-text-muted">Demo Mode</span>
          </div>
        )}
      </div>
    </aside>
  );
}
