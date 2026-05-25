"use client"
// app/page.tsx
import { useState } from "react"
import { SessionProvider } from "next-auth/react"
import Navbar from "@/src/components/navbar"
import PackageCard from "@/src/components/PackageCard"
import CurrencySelector from "@/src/components/CurrencySelector"
import { PACKAGES } from "@/src/lib/package"
import type { Currency } from "@/src/lib/currency"
import Link from "next/link"

function HomeContent() {
  const [currency, setCurrency] = useState<Currency>("EUR")

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar currency={currency} onCurrencyChange={(c) => setCurrency(c as Currency)} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-6">
          ★ Fixed-Price Packs
        </div>
        <h1 className="text-[clamp(56px,10vw,120px)] font-black uppercase leading-none tracking-tighter text-black">
          GET IT.
        </h1>
        <h2
          className="font-(family-name:--font-playfair) text-[clamp(40px,7vw,90px)] font-black italic leading-none tracking-tight text-black -mt-2"
          
        >
          sorted. <span className="text-[#FFD000] not-italic">✦</span>
        </h2>
        <p className="mt-6 text-base text-gray-600 max-w-md mx-auto leading-relaxed">
          Six fixed-price packs covering everything from starter to enterprise.
          Pick your pack, pay the listed price, get your files in under a week.
        </p>
        <a
          href="#packs"
          className="inline-block mt-8 bg-black text-[#FFD000] px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black"
        >
          View Packs ★
        </a>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────────────── */}
      <div className="bg-black text-white py-4 overflow-hidden border-y-2 border-black">
        <div className="flex animate-marquee whitespace-nowrap gap-12">
          {Array(6).fill(["STARTER PACKS", "BASIC PACKS", "STANDARD PACKS", "PRO PACKS", "BUSINESS PACKS", "ENTERPRISE PACKS"]).flat().map((label, i) => (
            <span key={i} className="text-sm font-black uppercase tracking-widest mx-6">
              ★ {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Packs ────────────────────────────────────────────────────────── */}
      <section id="packs" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
            ★ Brand Packs
          </div>
          <h2 className="text-[clamp(48px,8vw,100px)] font-black uppercase leading-none tracking-tighter">
            PICK A{" "}
            <span className="font-(family-name:--font-playfair) italic font-black" >
              pack.
            </span>
          </h2>
          <p className="text-gray-600 mt-4 text-sm">
            Each pack is delivered in 2–7 days. Need something custom?{" "}
            <a href="mailto:hello@brieflabstudio.com" className="font-bold underline">Get in touch.</a>
          </p>

          {/* Currency selector inline */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Currency:</span>
            <CurrencySelector value={currency} onChange={(c) => setCurrency(c as Currency)} />
          </div>
        </div>

        {/* 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PACKAGES.map((pack) => (
            <PackageCard key={pack.slug} pack={pack} currency={currency} />
          ))}
        </div>
      </section>

      {/* ── Delivery section ─────────────────────────────────────────────── */}
      <section id="delivery" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <div className="inline-block border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
            ★ Delivery & Proof
          </div>
          <h2 className="text-[clamp(40px,7vw,90px)] font-black uppercase leading-none tracking-tighter">
            FILES,{" "}
            <span className="font-(family-name:--font-playfair) italic">
              delivered.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: "i.",
              title: "Order Placed",
              body: "Pick your pack, complete checkout. We receive your order instantly.",
              bg: "bg-white border-2 border-black",
            },
            {
              num: "ii.",
              title: "Email Invoice",
              body: "A full invoice is sent to your email immediately after purchase.",
              bg: "bg-[#FFD000] border-2 border-black",
            },
            {
              num: "iii.",
              title: "Files Delivered",
              body: "Your files arrive within the delivery window — guaranteed.",
              bg: "bg-[#111] border-2 border-[#111] text-white",
            },
          ].map((step) => (
            <div key={step.num} className={`p-8 ${step.bg}`}>
              <p className={`font-(family-name:--font-playfair) font-black italic text-4xl mb-3 ${step.bg.includes("111") ? "text-[#FFD000]" : "text-black"}`}
                >
                {step.num}
              </p>
              <h3 className={`text-lg font-black uppercase tracking-widest mb-2 ${step.bg.includes("111") ? "text-white" : "text-black"}`}>
                {step.title}
              </h3>
              <p className={`text-sm leading-relaxed ${step.bg.includes("111") ? "text-gray-400" : "text-gray-600"}`}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-black text-white py-12 border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#FFD000] border-2 border-[#FFD000] flex items-center justify-center">
              <span className="text-black font-black text-xs">★</span>
            </div>
            <span className="font-black text-base tracking-widest uppercase">Brief Lab Studio</span>
          </div>
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Brief Lab Studio. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="/#packs" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#FFD000] transition-colors">Packs</a>
            <a href="/#delivery" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#FFD000] transition-colors">Delivery</a>
            <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#FFD000] transition-colors">Login</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  )
}