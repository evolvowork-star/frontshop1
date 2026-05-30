"use client"
// app/refund-policy/page.tsx
import Link from "next/link"

const sections = [
  {
    icon: "★",
    title: "30-Day Money-Back Guarantee",
    bg: "bg-[#FFD000] border-2 border-black",
    items: [
      { label: "Full refund window", detail: "Request a full refund any time within 30 days of purchase." },
      { label: "No usage threshold", detail: "We refund whether you downloaded once or many times." },
      { label: "No questions asked", detail: "You don't need to justify your reason for requesting a refund." },
    ],
  },
  {
    icon: "◷",
    title: "How To Request",
    bg: "bg-black border-2 border-black text-white",
    items: [
      { label: "Email us", detail: "Send your request to refunds@brieflabstudio.com." },
      { label: "Include order number", detail: "Add your order number and a short note about your request." },
      { label: "5 business days", detail: "We process all refunds within 5 business days back to the original payment method." },
    ],
  },
  {
    icon: "◈",
    title: "Quality Issues",
    bg: "bg-white border-2 border-black",
    items: [
      { label: "Corrupted file", detail: "If a generated file is corrupted or fails to produce output, we refund in full." },
      { label: "Wrong delivery", detail: "If your order doesn't match what you described, you're covered." },
      { label: "Zero hassle", detail: "Quality failures are refunded immediately — no questions asked." },
    ],
  },
  {
    icon: "▦",
    title: "Non-Refundable Cases",
    bg: "bg-white border-2 border-black",
    items: [
      { label: "After 30 days", detail: "Refunds are unavailable once 30 days have passed since purchase." },
      { label: "Fraudulent orders", detail: "Orders flagged as fraudulent or abusive are not eligible." },
      { label: "Terms violations", detail: "Generating content that infringes third-party rights or is unlawful voids eligibility." },
    ],
  },
  {
    icon: "❋",
    title: "Chargebacks",
    bg: "bg-[#FFD000] border-2 border-black",
    items: [
      { label: "Contact us first", detail: "We resolve 100% of legitimate refund requests directly." },
      { label: "Faster resolution", detail: "We act faster than your card issuer — usually within 5 business days." },
      { label: "Always reachable", detail: "refunds@brieflabstudio.com — we respond to every message." },
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-black text-white border-b-4 border-[#FFD000] overflow-hidden">
        {/* Background grid texture */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.06 }}
        >
          <defs>
            <pattern id="rp-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFD000" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rp-grid)" />
        </svg>

        {/* Decorative corner marks */}
        <div className="absolute top-6 left-6 w-10 h-10 border-l-2 border-t-2 border-[#FFD000] opacity-40" />
        <div className="absolute top-6 right-6 w-10 h-10 border-r-2 border-t-2 border-[#FFD000] opacity-40" />
        <div className="absolute bottom-6 left-6 w-10 h-10 border-l-2 border-b-2 border-[#FFD000] opacity-40" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-r-2 border-b-2 border-[#FFD000] opacity-40" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#FFD000] transition-colors mb-10 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
          </Link>

          <div className="inline-block border-2 border-[#FFD000] px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-6 text-[#FFD000]">
            ★ Legal Document
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-[clamp(52px,9vw,110px)] font-black uppercase leading-none tracking-tighter text-white">
                REFUND
              </h1>
              <h2 className="font-serif text-[clamp(38px,6vw,80px)] font-black italic leading-none tracking-tight text-[#FFD000] -mt-2">
                policy.
              </h2>
            </div>
            <div className="border border-gray-700 p-5 max-w-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Last Updated</p>
              <p className="text-sm font-bold text-white">February 2026</p>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Guarantee</p>
                <p className="text-xs text-[#FFD000] font-black">30-Day Money-Back</p>
                <p className="text-[10px] text-gray-500">No usage threshold · No questions asked</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-gray-400 text-sm leading-relaxed max-w-2xl">
            We want you happy with your purchase. This is a buy-and-receive-product service, and we stand behind every order with a real refund guarantee — no hoops, no small print traps.
          </p>
        </div>
      </section>

      {/* ── Highlight strip ───────────────────────────────────────── */}
      <div className="bg-[#FFD000] border-b-2 border-black py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8">
          {[
            { stat: "30", label: "Day Refund Window" },
            { stat: "5", label: "Business Days Processing" },
            { stat: "100%", label: "Legitimate Requests Resolved" },
            { stat: "0", label: "Usage Threshold" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black leading-none text-black">{item.stat}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-black/60 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content grid ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((sec, i) => {
            const isDark = sec.bg.includes("bg-black")
            const isYellow = sec.bg.includes("FFD000")
            return (
              <div
                key={i}
                className={`p-8 ${sec.bg} group hover:-translate-y-1 transition-transform duration-200 ${
                  i === 4 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="flex items-start gap-3 mb-6">
                  <span className={`text-3xl leading-none ${isDark ? "text-[#FFD000]" : "text-black"}`}>
                    {sec.icon}
                  </span>
                  <h3 className={`text-sm font-black uppercase tracking-widest leading-tight pt-1 ${isDark ? "text-white" : "text-black"}`}>
                    {sec.title}
                  </h3>
                </div>

                <ul className="space-y-4">
                  {sec.items.map((item, j) => (
                    <li key={j} className="flex gap-3">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isDark ? "bg-[#FFD000]" : isYellow ? "bg-black" : "bg-[#FFD000]"
                      }`} />
                      <div>
                        <span className={`text-xs font-black uppercase tracking-wide block ${
                          isDark ? "text-gray-200" : "text-black"
                        }`}>
                          {item.label}
                        </span>
                        <span className={`text-xs leading-relaxed ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {item.detail}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* ── CTA contact block ─────────────────────────────────── */}
        <div className="mt-10 bg-black border-2 border-black p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-block border-2 border-[#FFD000] px-3 py-0.5 text-[10px] font-black uppercase tracking-widest mb-3 text-[#FFD000]">
              ★ Request a Refund
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white">
              Need help with your order?
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Email us your order number — we handle it fast.
            </p>
          </div>
          <a
            href="mailto:refunds@brieflabstudio.com"
            className="flex-shrink-0 bg-[#FFD000] text-black px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-2 border-[#FFD000] whitespace-nowrap"
          >
            refunds@brieflabstudio.com →
          </a>
        </div>
      </section>

      {/* ── Legal footer strip ────────────────────────────────────── */}
      <div className="bg-[#111] text-white border-t-4 border-[#FFD000] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FFD000] flex items-center justify-center flex-shrink-0">
              <span className="text-black font-black text-sm">★</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Legal Entity</p>
              <p className="text-sm font-black text-white">Evoea Fakturaservice AB</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 text-xs text-gray-500">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Registration</p>
              <p className="font-bold text-gray-400">559117-4783</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Address</p>
              <p className="font-bold text-gray-400">Karlavägen 18, BV, 114 31 Stockholm, Sweden</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Platform</p>
              <p className="font-bold text-gray-400">Brief Lab Studio</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-gray-700 uppercase tracking-widest">
            © {new Date().getFullYear()} Evoea Fakturaservice AB · All rights reserved
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-[10px] text-gray-700 hover:text-gray-400 uppercase tracking-widest transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[10px] text-gray-700 hover:text-gray-400 uppercase tracking-widest transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-[10px] text-gray-700 hover:text-gray-400 uppercase tracking-widest transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}