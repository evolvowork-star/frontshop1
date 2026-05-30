"use client"
// app/cookies/page.tsx
import Link from "next/link"

const sections = [
  {
    icon: "◈",
    title: "What We Use",
    bg: "bg-white border-2 border-black",
    items: [
      { label: "Essential cookies only", detail: "We use only essential cookies and local storage to keep you logged in and remember your currency preference." },
      { label: "No ad trackers", detail: "We do not run third-party advertising trackers of any kind." },
      { label: "No consent banner needed", detail: "Because we use no non-essential cookies, no consent pop-up is required." },
    ],
  },
  {
    icon: "✦",
    title: "Currency Preference",
    bg: "bg-[#FFD000] border-2 border-black",
    items: [
      { label: "What it stores", detail: "Remembers your selected currency — EUR, USD, GBP, CAD, or AUD — so prices display correctly on every visit." },
      { label: "Where it lives", detail: "Stored in local storage on your device. Never transmitted to third parties." },
      { label: "How to clear it", detail: "Clear your browser's local storage or site data at any time to reset the preference." },
    ],
  },
  {
    icon: "⬡",
    title: "Session & Auth",
    bg: "bg-black border-2 border-black",
    items: [
      { label: "Login session", detail: "A session cookie keeps you authenticated while you browse. It expires when you close your browser or log out." },
      { label: "Security token", detail: "A CSRF token is used to protect form submissions from cross-site request forgery attacks." },
      { label: "No persistent tracking", detail: "Neither cookie tracks you across other websites or builds a profile." },
    ],
  },
  {
    icon: "▦",
    title: "Analytics",
    bg: "bg-white border-2 border-black",
    items: [
      { label: "Currently none", detail: "We do not run third-party analytics by default." },
      { label: "Future changes", detail: "If we add anonymised analytics in the future we will update this page and notify users before enabling it." },
      { label: "No fingerprinting", detail: "We do not use browser fingerprinting or cross-site tracking techniques." },
    ],
  },
  {
    icon: "◷",
    title: "Your Controls",
    bg: "bg-[#FFD000] border-2 border-black",
    items: [
      { label: "Browser settings", detail: "You can block or delete cookies at any time through your browser settings without losing access to the platform." },
      { label: "Local storage", detail: "Clear site data in your browser to remove stored currency preferences instantly." },
      { label: "No impact on core use", detail: "Blocking non-essential cookies has no effect since we don't use any." },
    ],
  },
  {
    icon: "❋",
    title: "Third Parties",
    bg: "bg-black border-2 border-black",
    items: [
      { label: "Payment processor", detail: "Our PCI-DSS Level 1 payment partner may set a session cookie solely to complete your transaction. It is not used for tracking." },
      { label: "No social pixels", detail: "No Facebook, Google, TikTok, or other advertising pixels are loaded on this site." },
      { label: "No CDN tracking", detail: "Static assets are served without third-party tracking scripts attached." },
    ],
  },
]

const stats = [
  { stat: "0", label: "Ad Trackers" },
  { stat: "2", label: "Essential Cookies" },
  { stat: "5", label: "Currencies Supported" },
  { stat: "0", label: "Third-Party Analytics" },
]

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-black text-white border-b-4 border-[#FFD000] overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.06 }}
        >
          <defs>
            <pattern id="ck-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFD000" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ck-grid)" />
        </svg>

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
                COOKIE
              </h1>
              <h2 className="font-serif text-[clamp(38px,6vw,80px)] font-black italic leading-none tracking-tight text-[#FFD000] -mt-2">
                policy.
              </h2>
            </div>
            <div className="border border-gray-700 p-5 max-w-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Last Updated</p>
              <p className="text-sm font-bold text-white">February 2026</p>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Cookie Type</p>
                <p className="text-xs text-[#FFD000] font-black">Essential Only</p>
                <p className="text-[10px] text-gray-500">Zero ad trackers · Zero analytics</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-gray-400 text-sm leading-relaxed max-w-2xl">
            We keep cookies minimal and purposeful. Brief Lab Studio uses only what is strictly necessary to keep you signed in and remember your currency. Nothing more.
          </p>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────── */}
      <div className="bg-[#FFD000] border-b-2 border-black py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8">
          {stats.map((item, i) => (
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
                className={`p-8 ${sec.bg} group hover:-translate-y-1 transition-transform duration-200`}
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

        {/* ── Cookie table ──────────────────────────────────────── */}
        <div className="mt-10 border-2 border-black overflow-hidden">
          <div className="bg-black px-8 py-5 flex items-center gap-3">
            <span className="text-[#FFD000] text-xl">▦</span>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Cookie Reference Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#FFD000] border-b-2 border-black">
                  {["Name", "Type", "Purpose", "Expiry"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left font-black uppercase tracking-widest text-black text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "session_id", type: "Session", purpose: "Keeps you authenticated while browsing", expiry: "Browser close" },
                  { name: "csrf_token", type: "Session", purpose: "Protects form submissions from CSRF attacks", expiry: "Browser close" },
                  { name: "currency_pref", type: "Local Storage", purpose: "Remembers your selected display currency", expiry: "Persistent" },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-[#F5F0E8]"}`}>
                    <td className="px-6 py-4 font-black text-black font-mono">{row.name}</td>
                    <td className="px-6 py-4 text-gray-600">{row.type}</td>
                    <td className="px-6 py-4 text-gray-600">{row.purpose}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${
                        row.expiry === "Persistent"
                          ? "border-[#FFD000] bg-[#FFD000] text-black"
                          : "border-black text-black"
                      }`}>
                        {row.expiry}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Contact CTA ───────────────────────────────────────── */}
        <div className="mt-10 bg-black border-2 border-black p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-block border-2 border-[#FFD000] px-3 py-0.5 text-[10px] font-black uppercase tracking-widest mb-3 text-[#FFD000]">
              ★ Questions?
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white">
              Concerns about cookies?
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              We'll respond to every message within 5 business days.
            </p>
          </div>
          <a
            href="mailto:privacy@brieflabstudio.com"
            className="flex-shrink-0 bg-[#FFD000] text-black px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-2 border-[#FFD000] whitespace-nowrap"
          >
            privacy@brieflabstudio.com →
          </a>
        </div>
      </section>

      {/* ── Legal footer ──────────────────────────────────────────── */}
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
            <Link href="/refund-policy" className="text-[10px] text-gray-700 hover:text-gray-400 uppercase tracking-widest transition-colors">
              Refunds
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}