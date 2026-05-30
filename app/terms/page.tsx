"use client"
// app/terms/page.tsx
import Link from "next/link"

const clauses = [
  {
    number: "01",
    title: "Acceptance",
    icon: "◈",
    bg: "bg-white border-2 border-black",
    content:
      "By purchasing a pack or creating an account you accept these Terms and our Privacy Policy.",
  },
  {
    number: "02",
    title: "Service Description",
    icon: "▦",
    bg: "bg-[#FFD000] border-2 border-black",
    content:
      "Brief Lab Studio sells pre-priced AI image generation packs and a custom-volume pack. Each pack grants the buyer a credit quota that can be exchanged for image generation through our platform.",
  },
  {
    number: "03",
    title: "License",
    icon: "★",
    bg: "bg-black border-2 border-black",
    content:
      "Subject to payment, Brief Lab Studio grants you a worldwide, non-exclusive, royalty-free license to use the generated images for commercial and personal purposes. Redistribution as part of a competing image-generation product is not permitted.",
  },
  {
    number: "04",
    title: "Prohibited Use",
    icon: "◷",
    bg: "bg-white border-2 border-black",
    content:
      "You may not use Brief Lab Studio to generate content that is unlawful, defamatory, infringes third-party rights, impersonates a real person without consent, or contains hate speech.",
  },
  {
    number: "05",
    title: "Payments",
    icon: "❋",
    bg: "bg-[#FFD000] border-2 border-black",
    content:
      "All prices are in EUR. Local currency prices shown on the site are estimates at today's mid-market FX rate. Card processing is performed by PCI-DSS Level 1 partners; we never store your card data.",
  },
  {
    number: "06",
    title: "Refunds",
    icon: "✦",
    bg: "bg-white border-2 border-black",
    content: "Refunds are governed by our Refund Policy.",
    link: { label: "View Refund Policy →", href: "/refund-policy" },
  },
  {
    number: "07",
    title: "Termination",
    icon: "⬡",
    bg: "bg-black border-2 border-black",
    content:
      "We may suspend accounts that violate these Terms. Unused quota in a suspended account is non-refundable in cases of severe abuse.",
  },
  {
    number: "08",
    title: "Limitation of Liability",
    icon: "◈",
    bg: "bg-white border-2 border-black",
    content:
      "To the maximum extent permitted by law, Brief Lab Studio's total liability is limited to the amount you paid for the relevant order.",
  },
  {
    number: "09",
    title: "Governing Law",
    icon: "▦",
    bg: "bg-[#FFD000] border-2 border-black",
    content:
      "These Terms are governed by the laws of Sweden. Any dispute will be settled in the courts of Stockholm.",
  },
]

const stats = [
  { stat: "9", label: "Clauses" },
  { stat: "30", label: "Day Refund Window" },
  { stat: "PCI", label: "DSS Level 1 Payments" },
  { stat: "EU", label: "GDPR Compliant" },
]

export default function TermsPage() {
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
            <pattern id="tc-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFD000" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tc-grid)" />
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
                TERMS &amp;
              </h1>
              <h2 className="font-serif text-[clamp(38px,6vw,80px)] font-black italic leading-none tracking-tight text-[#FFD000] -mt-2">
                conditions.
              </h2>
            </div>
            <div className="border border-gray-700 p-5 max-w-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Last Updated</p>
              <p className="text-sm font-bold text-white">February 2026</p>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Operated By</p>
                <p className="text-xs text-gray-300 font-bold">Evoea Fakturaservice AB</p>
                <p className="text-[10px] text-gray-500">Reg. no. 559117-4783</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-gray-400 text-sm leading-relaxed max-w-2xl">
            These Terms govern your use of the Brief Lab Studio image generation products and services, operated by Evoea Fakturaservice AB (Swedish reg. no. 559117-4783), with registered office at Karlavägen 18, BV, 114 31 Stockholm, Sweden.
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

      {/* ── Clauses grid ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clauses.map((clause, i) => {
            const isDark = clause.bg.includes("bg-black")
            const isYellow = clause.bg.includes("FFD000")
            return (
              <div
                key={i}
                className={`p-8 ${clause.bg} group hover:-translate-y-1 transition-transform duration-200 relative overflow-hidden`}
              >
                {/* Large clause number watermark */}
                <span
                  className={`absolute -top-3 -right-1 text-[72px] font-black leading-none select-none pointer-events-none ${
                    isDark ? "text-white/5" : isYellow ? "text-black/10" : "text-black/5"
                  }`}
                >
                  {clause.number}
                </span>

                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-5">
                    <span className={`text-2xl leading-none ${isDark ? "text-[#FFD000]" : "text-black"}`}>
                      {clause.icon}
                    </span>
                    <div>
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${
                        isDark ? "text-gray-500" : isYellow ? "text-black/50" : "text-gray-400"
                      }`}>
                        Clause {clause.number}
                      </p>
                      <h3 className={`text-sm font-black uppercase tracking-widest leading-tight ${
                        isDark ? "text-white" : "text-black"
                      }`}>
                        {clause.title}
                      </h3>
                    </div>
                  </div>

                  <div className={`w-8 h-px mb-5 ${isDark ? "bg-[#FFD000]" : "bg-black"}`} />

                  <p className={`text-xs leading-relaxed ${isDark ? "text-gray-400" : "text-gray-700"}`}>
                    {clause.content}
                  </p>

                  {clause.link && (
                    <Link
                      href={clause.link.href}
                      className={`inline-block mt-4 text-[10px] font-black uppercase tracking-widest underline underline-offset-4 ${
                        isDark ? "text-[#FFD000]" : "text-black"
                      }`}
                    >
                      {clause.link.label}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Contact CTA ───────────────────────────────────────── */}
        <div className="mt-10 bg-black border-2 border-black p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-block border-2 border-[#FFD000] px-3 py-0.5 text-[10px] font-black uppercase tracking-widest mb-3 text-[#FFD000]">
              ★ Questions?
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white">
              Need clarification on these Terms?
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Reach us at support and we'll respond within 5 business days.
            </p>
          </div>
          <a
            href="mailto:support@brieflabstudio.com"
            className="flex-shrink-0 bg-[#FFD000] text-black px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-2 border-[#FFD000] whitespace-nowrap"
          >
            support@brieflabstudio.com →
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
            <Link href="/refund-policy" className="text-[10px] text-gray-700 hover:text-gray-400 uppercase tracking-widest transition-colors">
              Refunds
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