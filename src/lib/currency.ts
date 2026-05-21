// src/lib/currency.ts

export type Currency = "EUR" | "GBP" | "USD" | "CAD" | "AUD"

export const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
]

// Approximate fixed rates vs EUR — update via env vars or a live API if needed
export const EXCHANGE_RATES: Record<Currency, number> = {
  EUR: 1,
  GBP: 0.86,
  USD: 1.08,
  CAD: 1.47,
  AUD: 1.65,
}

export function convertPrice(eurPrice: number, currency: Currency): number {
  return Math.round(eurPrice * EXCHANGE_RATES[currency])
}

export function formatPrice(amount: number, currency: Currency): string {
  const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency
  return `${sym}${amount.toLocaleString()}`
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency
}