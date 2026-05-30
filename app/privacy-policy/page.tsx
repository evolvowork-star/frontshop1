"use client"
// app/privacy-policy/page.tsx
import Link from "next/link"

const sections = [
  {
    icon: "◈",
    title: "Data We Collect",
    bg: "bg-white border-2 border-black",
    items: [
      { label: "Account details", detail: "Name and email address." },
      { label: "Order & billing details", detail: "Transaction records and invoicing information." },
      { label: "Text inputs", detail: "The text you paste or submit to generate assets." },
      { label: "Generated files", detail: "Audio files, images, and other outputs we create for you." },
      { label: "Technical logs", detail: "IP address, user-agent for security and analytics." },
    ],
  },
  {
    icon: "✦",
    title: "Why We Collect It",
    bg: "bg-[#FFD000] border-2 border-black",
    items: [
      { label: "Order fulfilment", detail: "To process your purchase and deliver your files." },
      { label: "Fraud prevention", detail: "To detect and block misuse of the platform." },
      { label: "Tax compliance", detail: "To meet our legal obligations under Swedish law." },
      { label: "Product improvement", detail: "To understand usage and improve our service." },
      { label: "We do not sell your data.", detail: "Your data is never sold or traded to third parties." },
    ],
  },
  {
    icon: "⬡",
    title: "Where It Lives",
    bg: "bg-black border-2 border-black text-white",
    items: [
      { label: "EU/EEA infrastructure", detail: "All data is hosted within the European Economic Area." },
      { label: "Encrypted at rest", detail: "AES-256 encryption protects stored data." },
      { label: "Encrypted in transit", detail: "TLS 1.3 secures all data in motion." },
    ],
  },
  {
    icon: "❋",
    title: "AI Providers",
    bg: "bg-white border-2 border-black",
    items: [
      { label: "OpenAI", detail: "Asset generation is performed via OpenAI APIs." },
      { label: "No training use", detail: "Text you submit is not retained by OpenAI for model training." },
      { label: "Data minimisation", detail: "Only the content required for generation is transmitted." },
    ],
  },
  {
    icon: "◷",
    title: "Your GDPR Rights",
    bg: "bg-[#FFD000] border-2 border-black",
    items: [
      { label: "Access", detail: "Request a copy of all personal data we hold about you." },
      { label: "Rectification", detail: "Ask us to correct any inaccurate information." },
      { label: "Deletion", detail: "Request erasure of your data at any time." },
      { label: "Export / Portability", detail: "Receive your data in a portable, machine-readable format." },
      { label: "Response time", detail: "We will respond to all requests within 30 days." },
    ],
  },
  {
    icon: "▦",
    title: "Cookies",
    bg: "bg-black border-2 border-black text-white",
    items: [
      { label: "Essential only", detail: "We use only session and currency preference cookies." },
      { label: "No ad trackers", detail: "Zero third-party advertising or tracking cookies." },
      { label: "No consent banner needed", detail: "Because we use no non-essential cookies." },
    ],
  },
  {
    icon: "★",
    title: "Data Retention",
    bg: "bg-white border-2 border-black",
    items: [
      { label: "7-year rule", detail: "Order data is retained for 7 years under Bokföringslagen (Swedish accounting law)." },
      { label: "Anonymisation", detail: "You may request anonymisation of your personal data at any time." },
      { label: "Account deletion", detail: "Closing your account removes all non-legally-required data." },
    ],
  },
]

export default function PrivacyPolicyPage() {
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
            <pattern id="pp-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFD000" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pp-grid)" />
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
                PRIVACY
              </h1>
              <h2 className="font-serif text-[clamp(38px,6vw,80px)] font-black italic leading-none tracking-tight text-[#FFD000] -mt-2">
                policy.
              </h2>
            </div>
            <div className="border border-gray-700 p-5 max-w-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Last Updated</p>
              <p className="text-sm font-bold text-white">February 2026</p>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Data Controller</p>
                <p className="text-xs text-gray-300 font-bold">Evoea Fakturaservice AB</p>
                <p className="text-[10px] text-gray-500">Reg. no. 559117-4783</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-gray-400 text-sm leading-relaxed max-w-2xl">
            We respect your privacy. This policy explains what we collect, why we collect it, and how we keep it safe. Evoea Fakturaservice AB (reg. no. 559117-4783) is the data controller for all personal data processed through the Brief Lab Studio platform.
          </p>
        </div>
      </section>

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
                {/* Icon + title */}
                <div className="flex items-start gap-3 mb-6">
                  <span className={`text-3xl leading-none ${isDark ? "text-[#FFD000]" : "text-black"}`}>
                    {sec.icon}
                  </span>
                  <h3 className={`text-sm font-black uppercase tracking-widest leading-tight pt-1 ${isDark ? "text-white" : "text-black"}`}>
                    {sec.title}
                  </h3>
                </div>

                {/* Items */}
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

        {/* ── Contact block ─────────────────────────────────────── */}
        <div className="mt-10 bg-[#FFD000] border-2 border-black p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-block border-2 border-black px-3 py-0.5 text-[10px] font-black uppercase tracking-widest mb-3 bg-black text-[#FFD000]">
              ★ Exercise Your Rights
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-black">
              Questions about your data?
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              Email us and we will respond within 30 days.
            </p>
          </div>
          <a
            href="mailto:privacy@brieflabstudio.com"
            className="flex-shrink-0 bg-black text-[#FFD000] px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-2 border-black whitespace-nowrap"
          >
            privacy@brieflabstudio.com →
          </a>
        </div>
      </section>

      {/* ── Legal entity footer strip ──────────────────────────── */}
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
            <Link href="/terms" className="text-[10px] text-gray-700 hover:text-gray-400 uppercase tracking-widest transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-[10px] text-gray-700 hover:text-gray-400 uppercase tracking-widest transition-colors">
              Cookies
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