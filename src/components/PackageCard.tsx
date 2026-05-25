"use client"
// src/components/PackageCard.tsx
import { useRouter } from "next/navigation"
import { PackageData } from "../lib/package" 
import { convertPrice, getCurrencySymbol, type Currency } from "@/src/lib/currency"
import { useSession } from "next-auth/react"

interface Props {
  pack: PackageData
  currency: Currency
}

const themeStyles = {
  light: {
    card: "bg-white border-2 border-black",
    name: "text-black",
    tagline: "text-black",
    price: "text-black",
    desc: "text-gray-600",
    bullet: "text-red-500",
    btn: "bg-black text-white hover:bg-[#FFD000] hover:text-black border-2 border-black",
    separator: "border-dashed border-black",
    badge: null,
  },
  yellow: {
    card: "bg-[#FFD000] border-2 border-black",
    name: "text-black",
    tagline: "text-black",
    price: "text-black",
    desc: "text-black/70",
    bullet: "text-black",
    btn: "bg-black text-[#FFD000] hover:bg-white hover:text-black border-2 border-black",
    separator: "border-dashed border-black",
    badge: "★ MOST POPULAR",
  },
  dark: {
    card: "bg-[#111] border-2 border-[#111]",
    name: "text-white",
    tagline: "text-[#FFD000]",
    price: "text-white",
    desc: "text-gray-400",
    bullet: "text-[#FFD000]",
    btn: "bg-[#FFD000] text-black hover:bg-white hover:text-black border-2 border-[#FFD000]",
    separator: "border-dashed border-gray-600",
    badge: null,
  },
}

export default function PackageCard({ pack, currency }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const theme = themeStyles[pack.theme as keyof typeof themeStyles]
  const price = convertPrice(pack.priceEur, currency)
  const symbol = getCurrencySymbol(currency)

  function handleSelect() {
    
      router.push(`/checkout?package=${pack.slug}`)
  }

  return (
    <div className={`relative flex flex-col p-8 ${theme.card} transition-transform hover:-translate-y-1`}>
      {/* Popular badge */}
      {theme.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-[#FFD000] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 border-2 border-black">
          {theme.badge}
        </div>
      )}

      {/* Pack name */}
      <div className="mb-4">
        <h3 className={`text-3xl font-black uppercase leading-none tracking-tight ${theme.name}`}>
          {pack.name}
        </h3>
        <p className={`text-xl font-black italic ${theme.tagline}`} style={{ fontFamily: "Georgia, serif" }}>
          {pack.tagline}
        </p>
        <p className={`text-sm mt-2 ${theme.desc}`}>{pack.description}</p>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className={`flex items-start leading-none ${theme.price}`}>
          <span className="text-2xl font-black mt-1">{symbol}</span>
          <span className="text-6xl font-black tracking-tight leading-none">{price}</span>
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${theme.desc}`}>
          ONE-TIME · {pack.deliveryDays} DAYS
        </p>
      </div>

      {/* Separator */}
      <hr className={`border-t-2 ${theme.separator} my-4`} />

      {/* Features */}
      <ul className="flex-1 space-y-2 mb-6">
        {pack.features.map((f:any) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className={`mt-0.5 text-xs font-black ${theme.bullet}`}>●</span>
            <span className={pack.theme === "dark" ? "text-gray-300" : "text-gray-700"}>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={handleSelect}
        className={`w-full py-3.5 text-sm font-black uppercase tracking-widest transition-colors ${theme.btn}`}
      >
        Buy {pack.name} →
      </button>
    </div>
  )
}