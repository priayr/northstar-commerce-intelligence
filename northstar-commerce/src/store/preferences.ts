import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ──────────────────────────────────────────────────────────
   Preferences Store — persisted to localStorage automatically
   ────────────────────────────────────────────────────────── */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR";
export type DateFormatOption = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type ComparisonPeriod = "previous" | "last_year";
export type TableDensity = "comfortable" | "compact";
export type ThemeOption = "light" | "dark" | "system";

export const CURRENCY_META: Record<CurrencyCode, { symbol: string; label: string; locale: string }> = {
  USD: { symbol: "$", label: "USD ($)", locale: "en-US" },
  EUR: { symbol: "€", label: "EUR (€)", locale: "de-DE" },
  GBP: { symbol: "£", label: "GBP (£)", locale: "en-GB" },
  INR: { symbol: "₹", label: "INR (₹)", locale: "en-IN" },
};

/**
 * Approximate exchange rates with USD as the base.
 * DB values are stored in USD; multiply by this rate for display.
 */
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
};

interface PreferencesState {
  theme: ThemeOption;
  currency: CurrencyCode;
  dateFormat: DateFormatOption;
  comparison: ComparisonPeriod;
  density: TableDensity;

  setTheme: (theme: ThemeOption) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setDateFormat: (dateFormat: DateFormatOption) => void;
  setComparison: (comparison: ComparisonPeriod) => void;
  setDensity: (density: TableDensity) => void;
  saveAll: (prefs: Partial<Omit<PreferencesState, "setTheme" | "setCurrency" | "setDateFormat" | "setComparison" | "setDensity" | "saveAll">>) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "system",
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      comparison: "previous",
      density: "comfortable",

      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setComparison: (comparison) => set({ comparison }),
      setDensity: (density) => set({ density }),
      saveAll: (prefs) => set(prefs),
    }),
    {
      name: "northstar_preferences",
    }
  )
);
