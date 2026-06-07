import { create } from "zustand";
import type { DatePreset } from "@/types";

/* ──────────────────────────────────────────────────────────
   Global Filter Store — Zustand (pure in-memory, no persist)
   ────────────────────────────────────────────────────────── */

interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

function makeDateRange(preset: DatePreset): DateRange {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (preset) {
    case "7d": {
      const from = new Date(to);
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      return { from, to, label: "Last 7 days" };
    }
    case "30d": {
      const from = new Date(to);
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      return { from, to, label: "Last 30 days" };
    }
    case "90d": {
      const from = new Date(to);
      from.setDate(from.getDate() - 89);
      from.setHours(0, 0, 0, 0);
      return { from, to, label: "Last 90 days" };
    }
    case "12m": {
      const from = new Date(to);
      from.setFullYear(from.getFullYear() - 1);
      from.setHours(0, 0, 0, 0);
      return { from, to, label: "Last 12 months" };
    }
    case "custom":
      // Return current range — will be overridden by setDateRange
      return { from: to, to, label: "Custom" };
  }
}

interface FilterStore {
  // State
  dateRange: DateRange;
  datePreset: DatePreset;
  selectedCategories: string[];
  selectedRegions: string[];
  selectedChannels: string[];
  comparisonPeriod: "previous" | "yoy";

  // Actions
  setDatePreset: (preset: DatePreset) => void;
  setDateRange: (from: Date, to: Date) => void;
  toggleCategory: (category: string) => void;
  toggleRegion: (region: string) => void;
  toggleChannel: (channel: string) => void;
  setCategories: (categories: string[]) => void;
  setRegions: (regions: string[]) => void;
  setChannels: (channels: string[]) => void;
  setComparisonPeriod: (period: "previous" | "yoy") => void;
  resetFilters: () => void;
}

const defaultPreset: DatePreset = "30d";

export const useFilterStore = create<FilterStore>((set) => ({
  dateRange: makeDateRange(defaultPreset),
  datePreset: defaultPreset,
  selectedCategories: [],
  selectedRegions: [],
  selectedChannels: [],
  comparisonPeriod: "previous",

  setDatePreset: (preset) =>
    set({ datePreset: preset, dateRange: makeDateRange(preset) }),

  setDateRange: (from, to) =>
    set({
      datePreset: "custom",
      dateRange: { from, to, label: "Custom" },
    }),

  toggleCategory: (category) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(category)
        ? state.selectedCategories.filter((c) => c !== category)
        : [...state.selectedCategories, category],
    })),

  toggleRegion: (region) =>
    set((state) => ({
      selectedRegions: state.selectedRegions.includes(region)
        ? state.selectedRegions.filter((r) => r !== region)
        : [...state.selectedRegions, region],
    })),

  toggleChannel: (channel) =>
    set((state) => ({
      selectedChannels: state.selectedChannels.includes(channel)
        ? state.selectedChannels.filter((c) => c !== channel)
        : [...state.selectedChannels, channel],
    })),

  setCategories: (categories) => set({ selectedCategories: categories }),
  setRegions: (regions) => set({ selectedRegions: regions }),
  setChannels: (channels) => set({ selectedChannels: channels }),

  setComparisonPeriod: (period) => set({ comparisonPeriod: period }),

  resetFilters: () =>
    set({
      dateRange: makeDateRange(defaultPreset),
      datePreset: defaultPreset,
      selectedCategories: [],
      selectedRegions: [],
      selectedChannels: [],
      comparisonPeriod: "previous",
    }),
}));

// ─── Theme store (in-memory only, NOT localStorage) ───

interface ThemeStore {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "light",
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}));

// ─── Sidebar store ───

interface SidebarStore {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  collapsed: false,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
}));
