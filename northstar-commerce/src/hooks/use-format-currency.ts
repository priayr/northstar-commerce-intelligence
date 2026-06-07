"use client";

import { usePreferencesStore, CURRENCY_META, EXCHANGE_RATES } from "@/store/preferences";
import { formatCurrency, formatCurrencyFull, formatValue } from "@/lib/utils";

/**
 * Hook that returns currency-aware formatters bound to the user's preference.
 * Values are multiplied by the exchange rate (USD base) before formatting,
 * so changing currency in Settings reflects correct converted amounts everywhere.
 */
export function useFormatCurrency() {
  const currency = usePreferencesStore((s) => s.currency);
  const meta = CURRENCY_META[currency];
  const rate = EXCHANGE_RATES[currency];

  /** Convert a raw USD value to the selected currency */
  const convert = (value: number) => value * rate;

  return {
    currency,
    /** Currency symbol (e.g. "$", "₹") — use in axis tick formatters */
    symbol: meta.symbol,
    rate,
    /** Format a USD value as the user's preferred currency (with conversion) */
    format: (value: number) => formatCurrency(convert(value), currency, meta.locale),
    /** Format as full currency without K/M abbreviation */
    formatFull: (value: number) => formatCurrencyFull(convert(value), currency, meta.locale),
    /** For KPICard — wraps formatValue but injects current currency + conversion */
    formatKPI: (value: number, fmt: "currency" | "percent" | "number") => {
      if (fmt === "currency") return formatCurrency(convert(value), currency, meta.locale);
      return formatValue(value, fmt);
    },
    /** Raw converter — use when you need the numeric converted value (e.g. for chart data) */
    convert,
  };
}
