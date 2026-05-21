"use client"
// src/components/Navbar.tsx
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import CurrencySelector from "./CurrencySelector"

interface NavbarProps {
  currency: string
  onCurrencyChange: (c: string) => void
}

export default function Navbar({ currency, onCurrencyChange }: NavbarProps) {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = session?.user && (session.user as any).role !== "USER"

  return (
    <header className="sticky top-0 z-50 bg-[#F5F0E8] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFD000] border-2 border-black flex items-center justify-center">
            <span className="text-black font-black text-xs">★</span>
          </div>
          <span className="font-black text-lg tracking-widest uppercase">PackShop</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#packs" className="text-sm font-bold uppercase tracking-widest hover:text-[#FFD000] transition-colors">
            Packs
          </Link>
          <Link href="/#delivery" className="text-sm font-bold uppercase tracking-widest hover:text-[#FFD000] transition-colors">
            Delivery
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm font-bold uppercase tracking-widest hover:text-[#FFD000] transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <CurrencySelector value={currency} onChange={onCurrencyChange} />

          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 border-2 border-black px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-[#FFD000] transition-colors"
              >
                <span className="hidden md:inline">{session.user?.name?.split(" ")[0] ?? "Account"}</span>
                <span>▾</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border-2 border-black z-50">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#FFD000] transition-colors border-b border-black"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
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
      </div>
    </header>
  )
}