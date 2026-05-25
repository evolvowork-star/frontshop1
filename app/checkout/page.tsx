"use client"
// app/checkout/page.tsx
import { useState, useEffect, useRef, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getPackageBySlug } from "@/src/lib/package"
import { CURRENCIES, convertPrice, type Currency } from "@/src/lib/currency"

type Tab = string
type GeneratingStatus = "idle" | "placing" | "generating" | "done" | "failed"

function CheckoutContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get("package") || ""

  const [currency, setCurrency] = useState<Currency>("EUR")
  const [notes, setNotes] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("logos")
  const [genStatus, setGenStatus] = useState<GeneratingStatus>("idle")
  const [successModal, setSuccessModal] = useState<{ invoiceNo: string; packageName: string } | null>(null)
  const [error, setError] = useState("")

  const pack = getPackageBySlug(slug)

  const [logoPrompts, setLogoPrompts] = useState<string[]>([])
  const [bannerPrompts, setBannerPrompts] = useState<string[]>([])
  const [extraPrompts, setExtraPrompts] = useState<Record<string, string[]>>({})

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!slug || !pack) router.push("/")
  }, [slug, pack, router])

  useEffect(() => {
    if (pack) {
      setLogoPrompts(Array(pack.logoCount).fill(""))
      setBannerPrompts(Array(pack.bannerCount).fill(""))
      // Initialize extra design prompts
      const extras: Record<string, string[]> = {}
      pack.extraDesigns.forEach((d) => { extras[d.key] = Array(d.count).fill("") })
      setExtraPrompts(extras)
    }
  }, [pack])
  function updateExtraPrompt(key: string, index: number, value: string) {
    setExtraPrompts((prev) => {
      const updated = { ...prev, [key]: [...(prev[key] ?? [])] }
      updated[key][index] = value
      return updated
    })
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  if (!pack) return null

  const price = convertPrice(pack.priceEur, currency)
  const currencyData = CURRENCIES.find((c) => c.code === currency)!

  const filledLogos = logoPrompts.filter((p) => p.trim().length > 0).length
  const filledBanners = bannerPrompts.filter((p) => p.trim().length > 0).length

  const filledExtra: Record<string, number> = {}
  pack?.extraDesigns.forEach((d) => {
    filledExtra[d.key] = (extraPrompts[d.key] ?? []).filter((p) => p.trim().length > 0).length
  })
  const totalExtraPrompts = pack?.extraDesigns.reduce((s, d) => s + d.count, 0) ?? 0
  const filledExtraTotal = Object.values(filledExtra).reduce((s, n) => s + n, 0)

  // Update totals:
  const totalPrompts = pack.logoCount + pack.bannerCount + totalExtraPrompts
  const filledTotal = filledLogos + filledBanners + filledExtraTotal

  function updateLogoPrompt(index: number, value: string) {
    setLogoPrompts((prev) => { const u = [...prev]; u[index] = value; return u })
  }
  function updateBannerPrompt(index: number, value: string) {
    setBannerPrompts((prev) => { const u = [...prev]; u[index] = value; return u })
  }

  // Poll order status every 4 seconds until COMPLETED or CANCELLED
  function startPolling(invoiceNo: string, packageName: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/order/status?invoiceNo=${invoiceNo}`)
        const data = await res.json()

        if (data.status === "COMPLETED") {
          clearInterval(pollRef.current!)
          setGenStatus("done")
          setSuccessModal({ invoiceNo, packageName })
        } else if (data.status === "CANCELLED") {
          clearInterval(pollRef.current!)
          setGenStatus("failed")
          setError("Design generation failed. Please contact support.")
        }
        // PROCESSING → keep polling
      } catch {
        // Network blip — keep polling silently
      }
    }, 4000)
  }

  async function handleOrder() {
    if (!pack) return
    if (filledLogos === 0 && filledBanners === 0 && filledExtraTotal === 0) {
      setError("Please provide at least one prompt before placing your order.")
      return
    }
    setError("")
    setGenStatus("placing")

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageSlug: slug, currency, notes, logoPrompts, bannerPrompts, extraPrompts }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Order failed")

      // Order placed — now wait for AI to finish
      setGenStatus("generating")
      startPolling(data.invoiceNo, pack.name)
    } catch (e: any) {
      setGenStatus("idle")
      setError(e.message)
    }
  }

  const isProcessing = genStatus === "placing" || genStatus === "generating"

  const generatingMessages: Record<GeneratingStatus, string> = {
    idle: "",
    placing: "Placing your order…",
    generating: `Generating your ${pack.logoCount + pack.bannerCount} designs with AI — this may take a few minutes…`,
    done: "Done!",
    failed: "Failed",
  }

  const tabs: { id: Tab; label: string; count: number; filled: number }[] = [
    { id: "logos", label: "Logo Prompts", count: pack.logoCount, filled: filledLogos },
    { id: "banners", label: "Banner Prompts", count: pack.bannerCount, filled: filledBanners },
    ...pack.extraDesigns.map((d) => ({
      id: d.key,
      label: d.pluralLabel,
      count: d.count,
      filled: filledExtra[d.key] ?? 0,
    })),
    { id: "details", label: "Order Details", count: 0, filled: 0 },
    { id: "payment", label: "Payment", count: 0, filled: 0 },
  ]

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* ── Top bar ── */}
      <div className="bg-black py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#FFD000] flex items-center justify-center">
            <span className="text-black font-black text-xs">★</span>
          </div>
          <span className="font-black text-base tracking-widest uppercase text-white">PackShop</span>
        </Link>
        <span className="text-[#FFD000] text-xs font-black uppercase tracking-widest">Secure Checkout</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">
          <Link href="/#packs" className="hover:text-black transition-colors">Packs</Link>
          <span>›</span>
          <span className="text-black">{pack.name} Pack</span>
          <span>›</span>
          <span className="text-black">Checkout</span>
        </div>

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="inline-block border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
            ★ Checkout
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-5xl font-black uppercase leading-none tracking-tighter">ORDER</h1>
              <h2 className="text-5xl font-black italic leading-none tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                summary.
              </h2>
            </div>
            <div className="flex items-center gap-3 bg-white border-2 border-black px-5 py-3 self-start">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Prompts Filled</span>
                <span className="text-2xl font-black leading-none">
                  {filledTotal}<span className="text-gray-400 text-base font-black">/{totalPrompts}</span>
                </span>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Package</span>
                <span className="text-sm font-black uppercase">{pack.name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Left — Tabs ── */}
          <div className="lg:col-span-3 space-y-0">
            {/* Tab bar */}
            <div className="flex border-2 border-black bg-white">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !isProcessing && setActiveTab(tab.id)}
                  disabled={isProcessing}
                  className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === tab.id
                    ? "bg-black text-[#FFD000]"
                    : "bg-white text-black hover:bg-[#F5F0E8]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-black border ${activeTab === tab.id
                      ? "border-[#FFD000] text-[#FFD000]"
                      : tab.filled === tab.count
                        ? "border-green-600 text-green-600"
                        : "border-gray-400 text-gray-400"
                      }`}>
                      {tab.filled}/{tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Tab: Logos ── */}
            {activeTab === "logos" && (
              <div className="border-2 border-t-0 border-black bg-white p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Logo Designs</p>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                      Provide a separate prompt for each logo. Include your company name, preferred style, colors, and mood for the best results.
                    </p>
                  </div>
                  <div className="bg-[#FFD000] border-2 border-black px-3 py-1.5 text-center shrink-0">
                    <p className="text-[10px] font-black uppercase tracking-widest">Total</p>
                    <p className="text-xl font-black leading-none">{pack.logoCount}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {logoPrompts.map((prompt, i) => (
                    <div key={i}>
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                        <span className={`w-5 h-5 flex items-center justify-center border-2 text-[10px] font-black ${prompt.trim() ? "bg-black text-[#FFD000] border-black" : "border-gray-300 text-gray-400"
                          }`}>{i + 1}</span>
                        Logo {i + 1}
                        {prompt.trim() && <span className="text-green-600 font-black">✓ Ready</span>}
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => updateLogoPrompt(i, e.target.value)}
                        disabled={isProcessing}
                        rows={3}
                        placeholder={`Describe logo ${i + 1} — e.g. "Modern minimalist logo for a tech startup called NovaByte, blue and white color scheme, clean sans-serif typography"`}
                        className="w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FFD000] transition-all resize-none placeholder:text-gray-400 disabled:opacity-60"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab("banners")}
                  disabled={isProcessing}
                  className="w-full bg-black text-[#FFD000] py-3 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black disabled:opacity-50"
                >
                  Next: Banner Prompts →
                </button>
              </div>
            )}

            {/* ── Tab: Banners ── */}
            {activeTab === "banners" && (
              <div className="border-2 border-t-0 border-black bg-white p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Banner Designs</p>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                      Provide a separate prompt for each banner. Mention the platform, dimensions, text content, and visual style you need.
                    </p>
                  </div>
                  <div className="bg-black border-2 border-black px-3 py-1.5 text-center shrink-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD000]">Total</p>
                    <p className="text-xl font-black leading-none text-white">{pack.bannerCount}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {bannerPrompts.map((prompt, i) => (
                    <div key={i}>
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                        <span className={`w-5 h-5 flex items-center justify-center border-2 text-[10px] font-black ${prompt.trim() ? "bg-black text-[#FFD000] border-black" : "border-gray-300 text-gray-400"
                          }`}>{i + 1}</span>
                        Banner {i + 1}
                        {prompt.trim() && <span className="text-green-600 font-black">✓ Ready</span>}
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => updateBannerPrompt(i, e.target.value)}
                        disabled={isProcessing}
                        rows={3}
                        placeholder={`Describe banner ${i + 1} — e.g. "LinkedIn banner for NovaByte, 1584x396px, dark navy background, white logo on left, tagline 'Build Tomorrow' on right"`}
                        className="w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FFD000] transition-all resize-none placeholder:text-gray-400 disabled:opacity-60"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setActiveTab("logos")} disabled={isProcessing}
                    className="flex-1 py-3 text-sm font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50">
                    ← Back
                  </button>
                  <button onClick={() => {
                    const nextTab = pack.extraDesigns.length > 0 ? pack.extraDesigns[0].key : "details"
                    setActiveTab(nextTab)
                  }}
                    className="flex-1 bg-black text-[#FFD000] py-3 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black disabled:opacity-50">
                    Next: Order Details →
                  </button>
                </div>
              </div>
            )}
            {pack.extraDesigns.map((design, di) =>
              activeTab === design.key ? (
                <div key={design.key} className="border-2 border-t-0 border-black bg-white p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                        {design.pluralLabel}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                        Provide a prompt for each {design.label.toLowerCase()}. Describe style, colors, mood,
                        and any specific text or elements you need.
                      </p>
                    </div>
                    <div className="bg-[#FFD000] border-2 border-black px-3 py-1.5 text-center shrink-0">
                      <p className="text-[10px] font-black uppercase tracking-widest">Total</p>
                      <p className="text-xl font-black leading-none">{design.count}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(extraPrompts[design.key] ?? []).map((prompt, i) => (
                      <div key={i}>
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                          <span className={`w-5 h-5 flex items-center justify-center border-2 text-[10px] font-black ${prompt.trim() ? "bg-black text-[#FFD000] border-black" : "border-gray-300 text-gray-400"
                            }`}>{i + 1}</span>
                          {design.label} {i + 1}
                          {prompt.trim() && <span className="text-green-600 font-black">✓ Ready</span>}
                        </label>
                        <textarea
                          value={prompt}
                          onChange={(e) => updateExtraPrompt(design.key, i, e.target.value)}
                          disabled={isProcessing}
                          rows={3}
                          placeholder={design.promptPlaceholder}
                          className="w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FFD000] transition-all resize-none placeholder:text-gray-400 disabled:opacity-60"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Go to previous tab
                        const prevTab = di === 0 ? "banners" : pack.extraDesigns[di - 1].key
                        setActiveTab(prevTab)
                      }}
                      disabled={isProcessing}
                      className="flex-1 py-3 text-sm font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        // Go to next tab
                        const nextTab = di === pack.extraDesigns.length - 1 ? "details" : pack.extraDesigns[di + 1].key
                        setActiveTab(nextTab)
                      }}
                      disabled={isProcessing}
                      className="flex-1 bg-black text-[#FFD000] py-3 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black disabled:opacity-50"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              ) : null
            )}
            {/* ── Tab: Order Details ── */}
            {activeTab === "details" && (
              <div className="border-2 border-t-0 border-black bg-white p-6 space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Your Details</p>
                  <div className="grid grid-cols-2 gap-4 bg-[#F5F0E8] border-2 border-black p-4">
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

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Prompts Summary</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border-2 border-black p-3 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest">Logos</span>
                      <span className={`text-sm font-black ${filledLogos === pack.logoCount ? "text-green-600" : "text-gray-400"}`}>
                        {filledLogos}/{pack.logoCount} filled
                      </span>
                    </div>
                    <div className="border-2 border-black p-3 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest">Banners</span>
                      <span className={`text-sm font-black ${filledBanners === pack.bannerCount ? "text-green-600" : "text-gray-400"}`}>
                        {filledBanners}/{pack.bannerCount} filled
                      </span>
                    </div>
                  </div>
                  {(filledLogos < pack.logoCount || filledBanners < pack.bannerCount) && (
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      ⚠ Unfilled prompts will be generated automatically by AI based on your package details.
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Payment Currency</p>
                  <div className="flex flex-wrap gap-2">
                    {CURRENCIES.map((c) => (
                      <button key={c.code} onClick={() => setCurrency(c.code)} disabled={isProcessing}
                        className={`px-4 py-2 text-sm font-black uppercase tracking-widest border-2 transition-colors disabled:opacity-50 ${currency === c.code ? "bg-black text-[#FFD000] border-black" : "bg-white text-black border-black hover:bg-[#F5F0E8]"
                          }`}>
                        {c.symbol} {c.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                    Additional Notes <span className="normal-case font-bold text-gray-400">(optional)</span>
                  </p>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isProcessing}
                    rows={3} placeholder="Any additional requirements or special instructions…"
                    className="w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FFD000] transition-all resize-none disabled:opacity-60"
                  />
                </div>

                {!isProcessing && (
                  <button onClick={() => setActiveTab("banners")}
                    className="text-xs font-black uppercase tracking-widest underline text-gray-500 hover:text-black transition-colors">
                    ← Edit Banner Prompts
                  </button>
                )}
                {!isProcessing && (
                  <button onClick={() => setActiveTab("payment")} disabled={isProcessing}
                    className="w-full bg-black text-[#FFD000] py-3 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black disabled:opacity-50">
                    Next: Payment →
                  </button>
                )}
              </div>
            )}
            {/* ── Tab: Payment ── */}
            {/* ── Tab: Payment ── */}
            {activeTab === "payment" && (
              <div className="border-2 border-t-0 border-black bg-white p-6 space-y-5">

                {/* Name + Email */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Your Details</p>
                  <div className="grid grid-cols-2 gap-4 bg-[#F5F0E8] border-2 border-black p-4">
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

                {/* Phone */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+92 300 0000000"
                    className="w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FFD000] transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Billing Address */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                    Billing Address
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Street Address"
                      className="w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FFD000] transition-all placeholder:text-gray-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FFD000] transition-all placeholder:text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="ZIP / Postal Code"
                        className="w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FFD000] transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Country"
                      className="w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FFD000] transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Pay with Card heading */}
                <div className="border-2 border-black">
                  <div className="bg-[#FFD000] px-5 py-4 border-b-2 border-black">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-0.5">Checkout</p>
                    <h3 className="text-lg font-black uppercase tracking-tight text-black">Pay with Card</h3>
                  </div>
                  <div className="px-5 py-4 flex items-center gap-2">
                    <span className="bg-[#1A1F71] text-white text-[9px] font-black px-2 py-1 uppercase tracking-wide">VISA</span>
                    <span className="bg-[#EB001B] text-white text-[9px] font-black px-2 py-1 uppercase tracking-wide">MC</span>
                    <span className="bg-black text-[#FFD000] text-[9px] font-black px-2 py-1 uppercase tracking-wide">AMEX</span>
                    <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                        <rect x="3" y="7" width="10" height="8" rx="1" /><path d="M5 7V5a3 3 0 016 0v2" />
                      </svg>
                      SSL Secured
                    </span>
                  </div>
                </div>

                {!isProcessing && (
                  <button onClick={() => setActiveTab("details")}
                    className="text-xs font-black uppercase tracking-widest underline text-gray-500 hover:text-black transition-colors">
                    ← Back to Order Details
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Right — Invoice panel ── */}
          <div className="lg:col-span-2">
            <div className="bg-[#111] text-white border-2 border-[#111] sticky top-8">
              <div className="bg-[#FFD000] px-6 py-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-black">Invoice</p>
                <p className="text-xs font-bold text-black/60">Generated on purchase</p>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Package</p>
                  <h3 className="text-3xl font-black uppercase leading-none">{pack.name}</h3>
                  <p className="text-[#FFD000] font-black italic text-lg" style={{ fontFamily: "Georgia, serif" }}>
                    {pack.tagline}
                  </p>
                </div>

                <hr className="border-dashed border-gray-600" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logos</p>
                    <p className="text-2xl font-black text-[#FFD000]">{pack.logoCount}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Banners</p>
                    <p className="text-2xl font-black text-[#FFD000]">{pack.bannerCount}</p>
                  </div>
                </div>

                <hr className="border-dashed border-gray-600" />

                <ul className="space-y-1.5">
                  {pack.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-[#FFD000] mt-0.5 shrink-0">●</span> {f}
                    </li>
                  ))}
                </ul>

                <hr className="border-dashed border-gray-600" />

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

                {/* Generating state */}
                {isProcessing && (
                  <div className="border-2 border-[#FFD000] p-4 space-y-3">
                    {/* Animated dots */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-2 h-2 bg-[#FFD000] block animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD000]">
                        {genStatus === "placing" ? "Placing Order" : "AI Generating"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {generatingMessages[genStatus]}
                    </p>
                    {genStatus === "generating" && (
                      <p className="text-[10px] text-gray-500">
                        Please keep this page open. You will receive an email once your designs are ready.
                      </p>
                    )}
                  </div>
                )}

                {/* Buy button */}
                {!isProcessing && (
                  <button
                    onClick={handleOrder}
                    disabled={activeTab !== "payment"}
                    className="w-full bg-[#FFD000] text-black py-4 text-sm font-black uppercase tracking-widest hover:bg-white transition-colors border-2 border-[#FFD000] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {activeTab !== "payment" ? "Complete All Steps First" : `Buy ${pack.name} Pack →`}
                  </button>
                )}

                {!isProcessing && activeTab !== "payment" && (
                  <p className="text-[10px] text-gray-500 text-center">
                    Please complete all steps before placing your order.
                  </p>
                )}

                {!isProcessing && (
                  <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                    By placing an order you agree to our terms. A full invoice will be sent to{" "}
                    <span className="text-gray-300">{session?.user?.email}</span>.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Generating overlay ── */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/40 z-40 pointer-events-none" />
      )}

      {/* ── Success Modal ── */}
      {successModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-[#F5F0E8] border-2 border-black max-w-md w-full">
            <div className="bg-[#FFD000] px-8 py-6 border-b-2 border-black">
              <div className="text-4xl mb-2">★</div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Designs Ready!</h2>
              <p className="text-sm font-bold mt-1">
                All your files have been generated and sent to your email.
              </p>
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
                Your <strong>{pack.logoCount} logos and {pack.bannerCount} banners</strong> have been
                delivered to <strong>{session?.user?.email}</strong>. Check your inbox — the invoice PDF
                and all design files are attached.
              </p>
              <div className="flex gap-3">
                <button onClick={() => router.push("/")}
                  className="flex-1 py-3 text-sm font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors">
                  Home
                </button>
                <button onClick={() => router.push("/#packs")}
                  className="flex-1 bg-black text-[#FFD000] py-3 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black">
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F0E8]" />}>
      <CheckoutContent />
    </Suspense>
  )
}