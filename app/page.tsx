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

// ── Animated hero background ────────────────────────────────────────────────
function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Diagonal moving lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.12 }}
      >
        <defs>
          <pattern
            id="diag-lines"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <line x1="0" y1="0" x2="0" y2="60" stroke="#000" strokeWidth="1" />
          </pattern>
          {/* Animated version that moves */}
          <pattern
            id="diag-lines-move"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-35)"
          >
            <line x1="0" y1="0" x2="0" y2="60" stroke="#000" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag-lines)" />
        <rect width="100%" height="100%" fill="url(#diag-lines-move)" style={{ opacity: 0.5 }} />
      </svg>

      {/* Moving highlight orbs */}
      <div
        className="absolute rounded-full"
        style={{
          width: "500px",
          height: "500px",
          top: "-100px",
          right: "-100px",
          background: "radial-gradient(circle, rgba(255,208,0,0.18) 0%, transparent 70%)",
          animation: "floatOrb1 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "400px",
          height: "400px",
          bottom: "-80px",
          left: "-80px",
          background: "radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)",
          animation: "floatOrb2 10s ease-in-out infinite",
        }}
      />

      {/* Decorative corner marks */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-black opacity-20" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-black opacity-20" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-black opacity-20" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-black opacity-20" />

      {/* Floating ★ marks */}
      {[
        { top: "15%", left: "8%", size: "text-2xl", delay: "0s" },
        { top: "70%", left: "5%", size: "text-base", delay: "1.5s" },
        { top: "20%", right: "6%", size: "text-lg", delay: "0.8s" },
        { top: "75%", right: "8%", size: "text-2xl", delay: "2s" },
        { top: "45%", left: "3%", size: "text-sm", delay: "3s" },
        { top: "50%", right: "4%", size: "text-sm", delay: "2.5s" },
      ].map((star, i) => (
        <span
          key={i}
          className={`absolute ${star.size} font-black text-black select-none`}
          style={{
            ...("left" in star ? { left: star.left } : { right: (star as { right: string }).right }),
            top: star.top,
            opacity: 0.1,
            animation: `starFloat 4s ease-in-out infinite`,
            animationDelay: star.delay,
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

// ── What We Create section ───────────────────────────────────────────────────
const services = [
  {
    icon: "❋",
    title: "Icons & Illustrations",
    desc: "Custom icon sets, UI icons, and editorial illustrations generated precisely to your brief.",
    tag: "SVG · PNG · Multi-size",
  },
  {
    icon: "◈",
    title: "Logos & Brand Identity",
    desc: "AI-crafted logos with full brand guidelines — wordmarks, monograms, symbol marks.",
    tag: "AI · Brand · Identity",
  },
  {
    icon: "▦",
    title: "Social Media Graphics",
    desc: "Reels covers, story templates, post graphics, and banners sized for every platform.",
    tag: "Instagram · X · LinkedIn",
  },
  {
    icon: "✦",
    title: "Custom AI Art",
    desc: "Unique artwork, product mockups, background textures, and creative visual assets.",
    tag: "Unlimited Styles",
  },
]

function WhatWeCreateSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left text */}
        <div className="">
          <div className="inline-block border-2 border-black bg-[#FFD000] px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-6">
            ★ What We Create
          </div>
          <h2 className="text-[clamp(40px,6vw,80px)] font-black uppercase leading-none tracking-tighter text-black mb-6">
            YOU SAY IT.{" "}
            <br />
            <span className="font-(family-name:--font-playfair) italic font-black">we build it.</span>
          </h2>
          <p className="text-gray-600 text-base leading-relaxed max-w-md mb-8">
            Brief Lab Studio is an AI-powered creative shop. You describe exactly what you need — icons, logos, social media posts, illustrations — and we generate and deliver polished, ready-to-use files. No design skills needed on your end.
          </p>
          <div className="flex flex-col gap-3">
            {["Describe your vision in plain language", "We generate using cutting-edge AI", "Files delivered, ready to use"].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-7 h-7 bg-black text-[#FFD000] flex items-center justify-center text-xs font-black flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm font-bold text-black">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right grid of service cards */}
        <div className="grid grid-cols-2 gap-4">
          {services.map((svc, i) => (
            <div
              key={i}
              className={`p-6 border-2 border-black group hover:-translate-y-1 transition-transform duration-200 ${
                i === 1 ? "bg-black text-white" : i === 3 ? "bg-[#FFD000]" : "bg-white"
              }`}
            >
              <span
                className={`text-3xl block mb-4 ${i === 1 ? "text-[#FFD000]" : "text-black"}`}
              >
                {svc.icon}
              </span>
              <h3
                className={`text-sm font-black uppercase tracking-widest mb-2 ${i === 1 ? "text-white" : "text-black"}`}
              >
                {svc.title}
              </h3>
              <p
                className={`text-xs leading-relaxed mb-3 ${i === 1 ? "text-gray-400" : "text-gray-600"}`}
              >
                {svc.desc}
              </p>
              <span
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 ${
                  i === 1
                    ? "bg-gray-800 text-gray-400"
                    : i === 3
                    ? "bg-black text-[#FFD000]"
                    : "bg-[#F5F0E8] text-black"
                }`}
              >
                {svc.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Trust / Stats section ────────────────────────────────────────────────────
const trustPoints = [
  {
    stat: "100%",
    label: "AI-Powered",
    detail: "Every asset created with state-of-the-art generative AI tools, reviewed by humans.",
    icon: "⬡",
    bg: "bg-[#FFD000]",
  },
  {
    stat: "Instant",
    label: "Delivery",
    detail: "Files will be sent to you via email. We guarantee your files within the stated window.",
    icon: "◷",
    bg: "bg-black text-white",
  },
  {
    stat: "Fixed",
    label: "Pricing — No Surprises",
    detail: "What you see is what you pay. No hidden fees, no hourly billing, no negotiations.",
    icon: "◈",
    bg: "bg-white border-2 border-black",
  },
  {
    stat: "∞",
    label: "Use Commercially",
    detail: "All files come with full commercial usage rights. Use them anywhere, forever.",
    icon: "✦",
    bg: "bg-white border-2 border-black",
  },
]

function TrustSection() {
  return (
    <section className="bg-[#111] py-24 border-y-4 border-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-block border-2 border-[#FFD000] bg-transparent px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-4 text-[#FFD000]">
            ★ Why Brief Lab Studio
          </div>
          <h2 className="text-[clamp(40px,6vw,80px)] font-black uppercase leading-none tracking-tighter text-white">
            BUILT FOR{" "}
            <span className="font-(family-name:--font-playfair) italic text-[#FFD000]">
              results.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustPoints.map((tp, i) => (
            <div
              key={i}
              className={`p-8 ${tp.bg} group hover:-translate-y-1 transition-transform duration-200`}
            >
              <span className={`text-4xl block mb-4 ${i === 1 ? "text-[#FFD000]" : "text-black"}`}>
                {tp.icon}
              </span>
              <p className={`text-4xl font-black leading-none mb-1 ${i === 1 ? "text-[#FFD000]" : "text-black"}`}>
                {tp.stat}
              </p>
              <p className={`text-xs font-black uppercase tracking-widest mb-3 ${i === 1 ? "text-gray-300" : "text-black"}`}>
                {tp.label}
              </p>
              <p className={`text-xs leading-relaxed ${i === 1 ? "text-gray-400" : "text-gray-600"}`}>
                {tp.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonial strip */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              quote: "Got my entire icon set instantly. Clean, consistent, exactly what I described.",
              name: "— Startup founder, Berlin",
            },
            {
              quote: "Fixed pricing is a game changer. No freelancer back-and-forth, just results.",
              name: "— Marketing director, Dubai",
            },
            {
              quote: "The logo pack exceeded expectations. Used it across all our brand materials.",
              name: "— E-commerce brand, London",
            },
          ].map((review, i) => (
            <div key={i} className="border border-gray-700 p-6">
              <p className="text-[#FFD000] text-2xl font-black mb-3 leading-none">&ldquo;</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{review.quote}</p>
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
function HomeContent() {
  const [currency, setCurrency] = useState<Currency>("EUR")

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar currency={currency} onCurrencyChange={(c) => setCurrency(c as Currency)} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center overflow-visible">
        <HeroBg />

        {/* Content sits above bg */}
        <div className="relative z-10">
          <div className="inline-block border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-6">
            ★ Fixed-Price AI Creative Packs
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
            AI-generated icons, logos, illustrations & social media graphics. Fixed prices. Fast delivery. Zero design skills needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a
              href="#packs"
              className="inline-block bg-black text-[#FFD000] px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black"
            >
              View Packs ★
            </a>
            <a
              href="#how-it-works"
              className="inline-block bg-transparent text-black px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors border-2 border-black"
            >
              How It Works →
            </a>
          </div>

          {/* Trust badges row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
            {["100% AI-Powered", "Instant Files Delivery", "Commercial License", "Fixed Pricing"].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD000] inline-block" />
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-600">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee ───────────────────────────────────────────────────── */}
      <div className="bg-black text-white py-4 overflow-hidden border-y-2 border-black">
        <div className="flex animate-marquee whitespace-nowrap gap-12">
          {Array(6)
            .fill(["ICONS", "LOGOS", "ILLUSTRATIONS", "SOCIAL POSTS", "BRAND IDENTITY", "AI ART"])
            .flat()
            .map((label, i) => (
              <span key={i} className="text-sm font-black uppercase tracking-widest mx-6">
                ★ {label}
              </span>
            ))}
        </div>
      </div>

      {/* ── What We Create ────────────────────────────────────────────── */}
      <WhatWeCreateSection />

      {/* ── Trust section ─────────────────────────────────────────────── */}
      <TrustSection />

      {/* ── Packs ─────────────────────────────────────────────────────── */}
      <section id="packs" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
            ★ Brand Packs
          </div>
          <h2 className="text-[clamp(48px,8vw,100px)] font-black uppercase leading-none tracking-tighter">
            PICK A{" "}
            <span className="font-(family-name:--font-playfair) italic font-black">
              pack.
            </span>
          </h2>
          <p className="text-gray-600 mt-4 text-sm">
            Each pack is delivered within the stated window. Need something custom?{" "}
            <a href="mailto:support@brieflabstudio.com" className="font-bold underline">
              Get in touch.
            </a>
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Currency:</span>
            <CurrencySelector value={currency} onChange={(c) => setCurrency(c as Currency)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PACKAGES.map((pack) => (
            <PackageCard key={pack.slug} pack={pack} currency={currency} />
          ))}
        </div>
      </section>

      {/* ── How It Works / Delivery ───────────────────────────────────── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <div className="inline-block border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
            ★ Delivery & Proof
          </div>
          <h2 className="text-[clamp(40px,7vw,90px)] font-black uppercase leading-none tracking-tighter">
            FILES,{" "}
            <span className="font-(family-name:--font-playfair) italic">delivered.</span>
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
              <p
                className={`font-(family-name:--font-playfair) font-black italic text-4xl mb-3 ${
                  step.bg.includes("111") ? "text-[#FFD000]" : "text-black"
                }`}
              >
                {step.num}
              </p>
              <h3
                className={`text-lg font-black uppercase tracking-widest mb-2 ${
                  step.bg.includes("111") ? "text-white" : "text-black"
                }`}
              >
                {step.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  step.bg.includes("111") ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      

      <style jsx global>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%       { transform: translate(-30px, 20px) scale(1.05); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%       { transform: translate(20px, -25px) scale(1.08); }
        }
        @keyframes starFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50%       { transform: translateY(-12px) rotate(15deg); opacity: 0.18; }
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