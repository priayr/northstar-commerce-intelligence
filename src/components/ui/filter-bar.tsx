"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/store/filters";
import { Calendar, ChevronDown, X, Search } from "lucide-react";
import type { DatePreset } from "@/types";

const datePresets: { label: string; value: DatePreset }[] = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "12m", value: "12m" },
];

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium",
          "border transition-colors-fast",
          selected.length > 0
            ? "border-accent bg-accent-subtle text-accent"
            : "border-border bg-surface-1 text-text-secondary hover:border-border-strong"
        )}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent text-white text-[10px]">
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-surface-1 border border-border rounded-lg shadow-lg z-50 animate-fade-in">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2">
              <Search size={12} className="text-text-muted flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="flex-1 bg-transparent text-[12px] text-text-primary outline-none placeholder:text-text-muted"
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="text-caption text-center py-3">No results</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  onClick={() => onToggle(option)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] text-left transition-colors-fast",
                    selected.includes(option)
                      ? "bg-accent-subtle text-accent"
                      : "text-text-primary hover:bg-surface-2"
                  )}
                >
                  <span
                    className={cn(
                      "w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0",
                      selected.includes(option)
                        ? "border-accent bg-accent"
                        : "border-border-strong"
                    )}
                  >
                    {selected.includes(option) && (
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 5L4 7L8 3"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span>{option}</span>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="p-2 border-t border-border">
              <button
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="text-[11px] text-text-muted hover:text-text-secondary transition-colors-fast"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Available filter options (will be populated from data) ───

const defaultCategories = [
  "Electronics",
  "Apparel",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Food & Beverage",
];

const defaultRegions = [
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
];

const defaultChannels = [
  "Organic",
  "Paid",
  "Email",
  "Social",
  "Direct",
];

export function FilterBar() {
  const {
    datePreset,
    setDatePreset,
    selectedCategories,
    selectedRegions,
    selectedChannels,
    toggleCategory,
    toggleRegion,
    toggleChannel,
    setCategories,
    setRegions,
    setChannels,
    resetFilters,
  } = useFilterStore();

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedRegions.length > 0 ||
    selectedChannels.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Date presets */}
      <div className="flex items-center rounded-md border border-border overflow-hidden">
        {datePresets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setDatePreset(preset.value)}
            className={cn(
              "px-2.5 py-1.5 text-[12px] font-medium transition-colors-fast",
              datePreset === preset.value
                ? "bg-accent text-white"
                : "bg-surface-1 text-text-secondary hover:bg-surface-2"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Filter dropdowns */}
      <FilterDropdown
        label="Category"
        options={defaultCategories}
        selected={selectedCategories}
        onToggle={toggleCategory}
        onClear={() => setCategories([])}
      />

      <FilterDropdown
        label="Region"
        options={defaultRegions}
        selected={selectedRegions}
        onToggle={toggleRegion}
        onClear={() => setRegions([])}
      />

      <FilterDropdown
        label="Channel"
        options={defaultChannels}
        selected={selectedChannels}
        onToggle={toggleChannel}
        onClear={() => setChannels([])}
      />

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] text-text-muted hover:text-text-secondary transition-colors-fast"
        >
          <X size={10} />
          Clear all
        </button>
      )}
    </div>
  );
}
