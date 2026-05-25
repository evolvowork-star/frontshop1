"use client"
// src/components/AdminNavbar.tsx
import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"

export default function AdminNavbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const role  = (session?.user as any)?.role ?? ""
  const name  = session?.user?.name ?? session?.user?.email ?? "Admin"
  const email = session?.user?.email ?? ""
  const image = session?.user?.image

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left — breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-5 h-5 bg-[#FFD000] flex items-center justify-center">
            <span className="text-black font-black text-[9px]">★</span>
          </div>
          <span className="font-black text-[11px] tracking-widest uppercase text-zinc-500 group-hover:text-amber-400 transition-colors">
            Brief Lab Studio
          </span>
        </Link>
        <span className="text-zinc-700 text-xs">/</span>
        <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400">
          Admin Panel
        </span>
      </div>

      {/* Right — profile dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          {/* Role badge */}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase bg-amber-400 text-zinc-900">
            {role}
          </span>

          {/* Avatar */}
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-7 h-7 rounded-full object-cover border border-zinc-700"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <span className="text-[11px] font-black text-amber-400">{initials}</span>
            </div>
          )}

          {/* Chevron */}
          <span className={`text-zinc-500 text-[10px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-700 shadow-2xl z-50">
            {/* User info */}
            <div className="px-4 py-3 border-b border-zinc-800">
              <p className="text-[11px] font-bold text-white truncate">{name}</p>
              <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">{email}</p>
            </div>

            {/* Sign out */}
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: "/login" }) }}
              className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
            >
              <span>Sign Out</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}