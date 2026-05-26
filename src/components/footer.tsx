"use client"
// src/components/Footer.tsx
import Link from "next/link"

const VisaLogo = () => (
  <svg viewBox="0 0 60 20" width="48" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="20" rx="3" fill="#1A1F71"/>
    <text x="5" y="15" fontFamily="serif" fontSize="13" fontWeight="bold" fill="#FFFFFF" letterSpacing="1">VISA</text>
  </svg>
)

const MastercardLogo = () => (
  <svg viewBox="0 0 50 32" width="40" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="16" r="13" fill="#EB001B"/>
    <circle cx="32" cy="16" r="13" fill="#F79E1B"/>
    <path d="M25 7.3a13 13 0 0 1 0 17.4A13 13 0 0 1 25 7.3z" fill="#FF5F00"/>
  </svg>
)

const footerLinks = {
  company: [
    { label: "About Us",     href: "/about" },
    { label: "How It Works", href: "/#packs" },
    { label: "Our Packs",    href: "/#packs" },
    { label: "Delivery Info",href: "/#delivery" },
  ],
  legal: [
    { label: "Privacy Policy",    href: "/privacy-policy" },
    { label: "Terms & Conditions",href: "/terms" },
    { label: "Cookie Policy",     href: "/cookies" },
    { label: "Refund Policy",     href: "/refund-policy" },
  ],
  support: [
    { label: "Contact Us",    href: "mailto:support@brieflabstudio.com" },
    { label: "FAQ",           href: "/faq" },
    { label: "Order Tracking",href: "/dashboard" },
    { label: "Report an Issue",href: "mailto:support@brieflabstudio.com" },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#0D0D0D] text-white border-t-4 border-[#FFD000]">

      {/* ── Top CTA strip ── */}
      <div className="bg-[#FFD000] text-black py-5 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black flex-shrink-0">★</span>
            <p className="text-sm font-black uppercase tracking-widest">
              Need something custom? We&apos;ve got you.
            </p>
          </div>
          <a
            href="mailto:support@brieflabstudio.com"
            className="bg-black text-[#FFD000] px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-2 border-black whitespace-nowrap"
          >
            Get In Touch →
          </a>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">

          {/* Brand column — full width on mobile */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-[#FFD000] flex items-center justify-center flex-shrink-0">
                <span className="text-black font-black text-sm">★</span>
              </div>
              <span className="font-black text-lg tracking-widest uppercase">Brief Lab Studio</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
              AI-powered creative assets — icons, logos, illustrations, and social media graphics — delivered fast, priced fixed. You describe it, we create it.
            </p>

            {/* Social icons */}
            <div className="flex gap-3 mb-8">
              {[
                { label: "X",  href: "#" },
                { label: "IG", href: "#" },
                { label: "IN", href: "#" },
                { label: "BE", href: "#" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="w-9 h-9 border border-gray-700 flex items-center justify-center text-[10px] font-black text-gray-400 hover:border-[#FFD000] hover:text-[#FFD000] transition-colors uppercase tracking-widest"
                >
                  {s.label}
                </a>
              ))}
            </div>

            {/* Payment badges */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                Secure Payments
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-white rounded px-2 py-1 flex items-center">
                  <VisaLogo />
                </div>
                <div className="bg-white rounded px-2 py-1 flex items-center h-8">
                  <MastercardLogo />
                </div>
                <div className="border border-gray-700 rounded px-3 py-1 flex items-center h-8">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Stripe</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company links */}
          <div className="col-span-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD000] mb-4 md:mb-5">
              Company
            </p>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="col-span-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD000] mb-4 md:mb-5">
              Legal
            </p>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links — full width on mobile so email box doesn't squeeze */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD000] mb-4 md:mb-5">
              Support
            </p>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 border border-gray-800 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Email Support</p>
              <a
                href="mailto:support@brieflabstudio.com"
                className="text-xs text-[#FFD000] font-bold hover:underline break-all"
              >
                support@brieflabstudio.com
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 md:mt-14 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs text-gray-600 uppercase tracking-widest">
            © {new Date().getFullYear()} Brief Lab Studio. All rights reserved.
          </p>
          <div className="flex gap-4 md:gap-6">
            <Link href="/privacy-policy" className="text-[10px] text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[10px] text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-[10px] text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors">
              Cookies
            </Link>
          </div>
          <p className="text-[10px] text-gray-700 uppercase tracking-widest">
            Powered by AI · Delivered by Humans
          </p>
        </div>
      </div>
    </footer>
  )
}