"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/filters";
import { FilterBar } from "@/components/ui/filter-bar";
import { Sun, Moon, Download } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/overview": "Executive Overview",
  "/revenue": "Revenue Quality",
  "/products": "Product & Category Intelligence",
  "/customers": "Customer Intelligence",
  "/basket": "Basket & Affinity Analysis",
  "/forecasts": "Forecasts & Alerts",
  "/data-studio": "Data Studio",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const pageTitle = pageTitles[pathname || ""] || "Northstar";

  return (
    <header className="flex items-center h-[52px] px-6 border-b border-border bg-surface-1 flex-shrink-0 gap-4">
      {/* Page title */}
      <h1 className="text-page-title whitespace-nowrap flex-shrink-0">
        {pageTitle}
      </h1>

      {/* Filter bar — center */}
      <div className="flex-1 flex justify-center overflow-x-auto">
        <FilterBar />
      </div>

      {/* Actions — right */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md",
            "text-text-muted hover:text-text-secondary hover:bg-surface-2",
            "transition-colors-fast"
          )}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? (
            <Moon size={16} strokeWidth={1.5} />
          ) : (
            <Sun size={16} strokeWidth={1.5} />
          )}
        </button>

        {/* Export */}
        <button
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md",
            "text-text-muted hover:text-text-secondary hover:bg-surface-2",
            "transition-colors-fast"
          )}
          title="Export data"
        >
          <Download size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
