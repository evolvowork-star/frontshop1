"use client"
// src/components/Navbar.tsx
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import CurrencySelector from "./CurrencySelector"

interface NavbarProps {
  currency: string
  onCurrencyChange: (c: string) => void
}

export default function Navbar({ currency, onCurrencyChange }: NavbarProps) {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen]         = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)

  const role    = (session?.user as any)?.role
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"

  const accountLink  = isAdmin ? "/admin"     : "/dashboard"
  const accountLabel = isAdmin ? "Admin"      : "Dashboard"

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-50 bg-[#F5F0E8] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-8 h-8 bg-[#FFD000] border-2 border-black flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-xs">★</span>
          </div>
          <span className="font-black text-base md:text-lg tracking-widest uppercase leading-none">
            Brief Lab Studio
          </span>
        </Link>

        {/* ── Center nav (desktop only) ── */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#packs"
            className="text-sm font-bold uppercase tracking-widest hover:text-[#FFD000] transition-colors">
            Packs
          </Link>
          <Link href="/#delivery"
            className="text-sm font-bold uppercase tracking-widest hover:text-[#FFD000] transition-colors">
            Delivery
          </Link>
          {session && (
            <Link href={accountLink}
              className="text-sm font-bold uppercase tracking-widest hover:text-[#FFD000] transition-colors">
              {accountLabel}
            </Link>
          )}
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* Currency selector — always visible */}
          <CurrencySelector value={currency} onChange={onCurrencyChange} />

          {/* Desktop: account dropdown / login */}
          <div className="hidden md:flex items-center">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 border-2 border-black px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-[#FFD000] transition-colors"
                >
                  <span className="hidden md:inline">
                    {session.user?.name?.split(" ")[0] ?? "Account"}
                  </span>
                  <span>▾</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border-2 border-black z-50">
                    <div className="px-4 py-3 border-b-2 border-black bg-[#F5F0E8]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Signed in as
                      </p>
                      <p className="text-sm font-black truncate mt-0.5">
                        {session.user?.name ?? session.user?.email}
                      </p>
                    </div>

                    <Link
                      href={accountLink}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#FFD000] transition-colors border-b border-gray-100"
                    >
                      <span>{accountLabel}</span>
                      <span className="text-xs">→</span>
                    </Link>

                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }) }}
                      className="w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-black text-[#FFD000] px-5 py-2 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black"
              >
                Login
              </Link>
            )}
          </div>

          {/* ── Hamburger button (mobile only) ── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 border-2 border-black bg-transparent hover:bg-black group transition-colors flex-shrink-0"
          >
            <span className={`block w-5 h-0.5 bg-black group-hover:bg-[#FFD000] transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block w-5 h-0.5 bg-black group-hover:bg-[#FFD000] transition-all duration-300 my-1 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-black group-hover:bg-[#FFD000] transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Drawer ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } bg-[#F5F0E8] border-t-2 border-black`}
      >
        <div className="px-4 py-2 flex flex-col">

          {/* Nav links */}
          <Link
            href="/#packs"
            onClick={() => setMobileOpen(false)}
            className="py-4 text-sm font-bold uppercase tracking-widest border-b-2 border-black hover:text-[#FFD000] transition-colors flex items-center justify-between"
          >
            <span>Packs</span>
            <span className="text-xs">→</span>
          </Link>
          <Link
            href="/#delivery"
            onClick={() => setMobileOpen(false)}
            className="py-4 text-sm font-bold uppercase tracking-widest border-b-2 border-black hover:text-[#FFD000] transition-colors flex items-center justify-between"
          >
            <span>Delivery</span>
            <span className="text-xs">→</span>
          </Link>

          {session ? (
            <>
              {/* Signed in as */}
              <div className="py-4 border-b-2 border-black">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Signed in as
                </p>
                <p className="text-sm font-black mt-0.5 truncate">
                  {session.user?.name ?? session.user?.email}
                </p>
              </div>

              {/* Dashboard / Admin */}
              <Link
                href={accountLink}
                onClick={() => setMobileOpen(false)}
                className="py-4 text-sm font-bold uppercase tracking-widest border-b-2 border-black hover:text-[#FFD000] transition-colors flex items-center justify-between"
              >
                <span>{accountLabel}</span>
                <span className="text-xs">→</span>
              </Link>

              {/* Sign out */}
              <button
                onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }) }}
                className="py-4 text-sm font-bold uppercase tracking-widest text-left hover:text-[#FFD000] transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="my-4 bg-black text-[#FFD000] px-5 py-3 text-sm font-black uppercase tracking-widest text-center hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}