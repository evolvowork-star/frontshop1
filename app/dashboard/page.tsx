"use client"
// app/dashboard/page.tsx
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PackageSnapshot {
  name:        string
  tagline:     string
  description: string
  features:    string[]
  priceEur:    number
  logoCount:   number
  bannerCount: number
  theme:       string
}

interface Order {
  id:              string
  invoiceNo:       string
  status:          "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED"
  currency:        string
  amount:          number
  packageSnapshot: PackageSnapshot
  notes:           string | null
  createdAt:       string
}

interface DashboardData {
  user: {
    name:      string | null
    email:     string
    image:     string | null
    createdAt: string
  }
  orders:     Order[]
  totalSpent: number
}

const STATUS_CONFIG = {
  COMPLETED:  { label: "Completed",  bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
  PROCESSING: { label: "Processing", bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  PENDING:    { label: "Pending",    bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400"   },
  CANCELLED:  { label: "Cancelled",  bg: "bg-red-100",    text: "text-red-600",    dot: "bg-red-400"    },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  })
}

function formatCurrency(amount: number, currency: string) {
  const symbols: Record<string, string> = {
    EUR: "€", USD: "$", GBP: "£", PKR: "₨", AED: "د.إ",
  }
  return `${symbols[currency] ?? currency}${amount.toLocaleString()}`
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [activeOrder, setActiveOrder] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-3 h-3 bg-black block animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Loading Dashboard</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-6">
        <div className="bg-white border-2 border-black p-8 max-w-sm w-full text-center">
          <p className="text-4xl mb-4">✕</p>
          <p className="font-black uppercase tracking-widest text-sm mb-2">Something went wrong</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button onClick={() => window.location.reload()}
            className="mt-6 w-full bg-black text-[#FFD000] py-3 text-xs font-black uppercase tracking-widest">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const completedOrders = data.orders.filter((o) => o.status === "COMPLETED").length
  const totalLogos      = data.orders.filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + (o.packageSnapshot.logoCount ?? 0), 0)
  const totalBanners    = data.orders.filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + (o.packageSnapshot.bannerCount ?? 0), 0)

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* ── Top bar ── */}
      <div className="bg-black py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#FFD000] flex items-center justify-center">
            <span className="text-black font-black text-xs">★</span>
          </div>
          <span className="font-black text-base tracking-widest uppercase text-white">Brief Lab Studio</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest hidden sm:block">
            {data.user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#FFD000] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="inline-block border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
            ★ My Dashboard
          </div>
          <h1 className="text-5xl font-black uppercase leading-none tracking-tighter">
            Welcome back,
          </h1>
          <h2 className="text-5xl font-black italic leading-none tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}>
            {data.user.name?.split(" ")[0] ?? "there"}.
          </h2>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Orders",   value: data.orders.length,  bg: "bg-white border-2 border-black" },
            { label: "Completed",      value: completedOrders,      bg: "bg-[#FFD000] border-2 border-black" },
            { label: "Logos Generated",value: totalLogos,           bg: "bg-black text-white border-2 border-black" },
            { label: "Banners Generated", value: totalBanners,      bg: "bg-white border-2 border-black" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} p-5`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${stat.bg.includes("bg-black") ? "text-gray-400" : "text-gray-500"}`}>
                {stat.label}
              </p>
              <p className={`text-4xl font-black leading-none ${stat.bg.includes("bg-black") ? "text-[#FFD000]" : "text-black"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Orders list ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Order History ({data.orders.length})
              </p>
            </div>

            {data.orders.length === 0 ? (
              <div className="bg-white border-2 border-black p-10 text-center">
                <p className="text-4xl mb-4">○</p>
                <p className="font-black uppercase tracking-widest text-sm mb-2">No orders yet</p>
                <p className="text-gray-500 text-sm mb-6">Pick a pack and get your designs generated instantly.</p>
                <Link href="/#packs"
                  className="inline-block bg-black text-[#FFD000] px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black">
                  Browse Packs →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.orders.map((order) => {
                  const cfg      = STATUS_CONFIG[order.status]
                  const snap     = order.packageSnapshot
                  const expanded = activeOrder === order.id

                  return (
                    <div key={order.id} className="bg-white border-2 border-black">
                      {/* Order row */}
                      <button
                        onClick={() => setActiveOrder(expanded ? null : order.id)}
                        className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-[#F5F0E8] transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Package theme dot */}
                          <div className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 border-black font-black text-xs ${
                            snap.theme === "yellow" ? "bg-[#FFD000]" :
                            snap.theme === "dark"   ? "bg-black text-[#FFD000]" :
                            "bg-white"
                          }`}>
                            ★
                          </div>
                          <div className="min-w-0">
                            <p className="font-black uppercase tracking-widest text-sm truncate">
                              {snap.name} Pack
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">
                              {order.invoiceNo} · {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Status badge */}
                          <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          {/* Amount */}
                          <span className="font-black text-sm">
                            {formatCurrency(order.amount, order.currency)}
                          </span>
                          {/* Expand arrow */}
                          <span className={`text-xs font-black transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
                        </div>
                      </button>

                      {/* Expanded details */}
                      {expanded && (
                        <div className="border-t-2 border-black p-5 space-y-5 bg-[#F5F0E8]">
                          {/* Status mobile */}
                          <div className="sm:hidden">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </div>

                          {/* Files summary */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white border-2 border-black p-3 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logos</p>
                              <p className="text-3xl font-black text-black">{snap.logoCount ?? "—"}</p>
                              <p className="text-[10px] text-gray-400 font-bold">PNG + JPG each</p>
                            </div>
                            <div className="bg-white border-2 border-black p-3 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Banners</p>
                              <p className="text-3xl font-black text-black">{snap.bannerCount ?? "—"}</p>
                              <p className="text-[10px] text-gray-400 font-bold">PNG + JPG each</p>
                            </div>
                          </div>

                          {/* What's included */}
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                              What Was Included
                            </p>
                            <ul className="space-y-1">
                              {snap.features.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                  <span className="text-[#FFD000] font-black shrink-0">●</span> {f}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Payment details */}
                          <div className="bg-black text-white p-4 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount Paid</p>
                              <p className="text-xl font-black text-[#FFD000]">
                                {formatCurrency(order.amount, order.currency)}
                                <span className="text-xs text-gray-400 ml-1">{order.currency}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Invoice</p>
                              <p className="text-sm font-black text-white">{order.invoiceNo}</p>
                            </div>
                          </div>

                          {/* Notes */}
                          {order.notes && (
                            <div className="border-l-2 border-[#FFD000] pl-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Notes</p>
                              <p className="text-xs text-gray-600">{order.notes}</p>
                            </div>
                          )}

                          {/* Delivery note */}
                          {order.status === "COMPLETED" && (
                            <div className="bg-green-50 border border-green-200 px-4 py-3">
                              <p className="text-xs font-bold text-green-700">
                                ✓ Your designs were delivered to <strong>{data.user.email}</strong>. Check your inbox for PNG and JPG files.
                              </p>
                            </div>
                          )}
                          {order.status === "PROCESSING" && (
                            <div className="bg-yellow-50 border border-yellow-200 px-4 py-3">
                              <p className="text-xs font-bold text-yellow-700">
                                ⏳ AI is still generating your designs. You will receive an email once they are ready.
                              </p>
                            </div>
                          )}
                          {order.status === "CANCELLED" && (
                            <div className="bg-red-50 border border-red-200 px-4 py-3">
                              <p className="text-xs font-bold text-red-700">
                                ✕ Generation failed for this order. Please contact support with your invoice number.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Right: Account info + CTA ── */}
          <div className="space-y-4">
            {/* Account card */}
            <div className="bg-white border-2 border-black">
              <div className="bg-black px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Name</p>
                  <p className="font-black text-sm">{data.user.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
                  <p className="font-bold text-sm break-all">{data.user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Member Since</p>
                  <p className="font-bold text-sm">{formatDate(data.user.createdAt)}</p>
                </div>
                <hr className="border-black" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Spent</p>
                  <p className="text-3xl font-black">€{data.totalSpent.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">across {completedOrders} order{completedOrders !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#FFD000] border-2 border-black p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-2">Need More Designs?</p>
              <p className="font-black text-lg uppercase leading-tight mb-4">Get another pack.</p>
              <Link href="/#packs"
                className="block w-full text-center bg-black text-[#FFD000] py-3 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-2 border-black">
                Browse Packs →
              </Link>
            </div>

            {/* Files reminder */}
            <div className="bg-white border-2 border-black p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">File Delivery</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                All generated designs are sent directly to your email as <strong>PNG and JPG</strong> attachments along with a PDF invoice. Check your inbox or spam folder.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-black mt-16 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">
            © {new Date().getFullYear()} Brief Lab Studio
          </span>
          <div className="flex gap-6">
            <Link href="/#packs" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Packs</Link>
            <Link href="/#delivery" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Delivery</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}