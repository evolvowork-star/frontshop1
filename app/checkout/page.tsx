"use client"
// app/checkout/page.tsx
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getPackageBySlug } from "@/src/lib/package"
import { CURRENCIES, convertPrice, type Currency } from "@/src/lib/currency"

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get("package") || ""

  const [currency, setCurrency] = useState<Currency>("EUR")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [successModal, setSuccessModal] = useState<{ invoiceNo: string; packageName: string } | null>(null)
  const [error, setError] = useState("")

  const pack = getPackageBySlug(slug)

  useEffect(() => {
    if (!slug || !pack) router.push("/")
  }, [slug, pack, router])

  if (!pack) return null

  const price = convertPrice(pack.priceEur, currency)
  const currencyData = CURRENCIES.find((c) => c.code === currency)!

  async function handleOrder() {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageSlug: slug, currency, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Order failed")
      if (pack) setSuccessModal({ invoiceNo: data.invoiceNo, packageName: pack.name })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Top bar */}
      <div className="bg-black py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#FFD000] flex items-center justify-center">
            <span className="text-black font-black text-xs">★</span>
          </div>
          <span className="font-black text-base tracking-widest uppercase text-white">PackShop</span>
        </Link>
        <span className="text-[#FFD000] text-xs font-black uppercase tracking-widest">Secure Checkout</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">
          <Link href="/#packs" className="hover:text-black">Packs</Link>
          <span>›</span>
          <span className="text-black">{pack.name} Pack</span>
          <span>›</span>
          <span className="text-black">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left – Order form */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="inline-block border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
                ★ Checkout
              </div>
              <h1 className="text-4xl font-black uppercase leading-none tracking-tighter">
                ORDER
              </h1>
              <h2 className="text-4xl font-black italic leading-none"
                style={{ fontFamily: "Georgia, serif" }}>
                summary.
              </h2>
            </div>

            {/* Customer info (read-only) */}
            <div className="bg-white border-2 border-black p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-500">
                Your Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Name</p>
                  <p className="font-bold text-sm">{session?.user?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
                  <p className="font-bold text-sm">{session?.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Currency */}
            <div className="bg-white border-2 border-black p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-500">
                Payment Currency
              </h3>
              <div className="flex flex-wrap gap-3">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={`px-4 py-2 text-sm font-black uppercase tracking-widest border-2 transition-colors ${
                      currency === c.code
                        ? "bg-black text-[#FFD000] border-black"
                        : "bg-white text-black border-black hover:bg-[#F5F0E8]"
                    }`}
                  >
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white border-2 border-black p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-500">
                Order Notes (optional)
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any specific requirements or notes…"
                className="w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#FFD000] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Right – Invoice panel */}
          <div className="lg:col-span-2">
            <div className="bg-[#111] text-white border-2 border-[#111] sticky top-8">
              {/* Invoice header */}
              <div className="bg-[#FFD000] px-6 py-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-black">Invoice</p>
                <p className="text-xs font-bold text-black/60">Generated on purchase</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Pack */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Package</p>
                  <h3 className="text-3xl font-black uppercase leading-none">{pack.name}</h3>
                  <p className="text-[#FFD000] font-black italic text-lg" style={{ fontFamily: "Georgia, serif" }}>
                    {pack.tagline}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Delivery: {pack.deliveryDays} days</p>
                </div>

                <hr className="border-dashed border-gray-600" />

                {/* Features summary */}
                <ul className="space-y-1.5">
                  {pack.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-[#FFD000] mt-0.5">●</span> {f}
                    </li>
                  ))}
                </ul>

                <hr className="border-dashed border-gray-600" />

                {/* Price */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total</p>
                    <p className="text-xs text-gray-500">One-time payment</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-start leading-none">
                      <span className="text-xl font-black text-[#FFD000] mt-1">{currencyData.symbol}</span>
                      <span className="text-5xl font-black text-white leading-none">{price}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{currency}</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-500 px-4 py-3 text-xs font-bold text-red-400">
                    {error}
                  </div>
                )}

                {/* Buy button */}
                <button
                  onClick={handleOrder}
                  disabled={loading}
                  className="w-full bg-[#FFD000] text-black py-4 text-sm font-black uppercase tracking-widest hover:bg-white transition-colors border-2 border-[#FFD000] disabled:opacity-60"
                >
                  {loading ? "Processing…" : `Buy ${pack.name} Pack →`}
                </button>

                <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                  By placing an order you agree to our terms. An invoice will be emailed to {session?.user?.email}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success Modal ─────────────────────────────────────────────────── */}
      {successModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-[#F5F0E8] border-2 border-black max-w-md w-full">
            <div className="bg-[#FFD000] px-8 py-6 border-b-2 border-black">
              <div className="text-4xl mb-2">★</div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Order Placed!</h2>
              <p className="text-sm font-bold mt-1">Your invoice is on its way.</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="bg-white border-2 border-black p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Invoice No.</p>
                <p className="font-black text-xl tracking-widest">{successModal.invoiceNo}</p>
              </div>
              <div className="bg-white border-2 border-black p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Package</p>
                <p className="font-black text-xl uppercase">{successModal.packageName}</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A confirmation email with your full invoice has been sent to{" "}
                <strong>{session?.user?.email}</strong>. Our team will process your order shortly.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 py-3 text-sm font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => router.push("/#packs")}
                  className="flex-1 bg-black text-[#FFD000] py-3 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black"
                >
                  More Packs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}