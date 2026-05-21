"use client"
// src/components/CurrencySelector.tsx
import { CURRENCIES } from "@/src/lib/currency"

interface Props {
  value: string
  onChange: (currency: string) => void
}

export default function CurrencySelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-2 border-black bg-[#F5F0E8] px-3 py-2 text-sm font-bold uppercase tracking-widest cursor-pointer focus:outline-none focus:bg-[#FFD000] transition-colors"
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.symbol} {c.code}
        </option>
      ))}
    </select>
  )
}