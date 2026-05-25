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

// ── Full country list ──────────────────────────────────────────────────────────
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium",
  "Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei",
  "Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic",
  "Chad","Chile","China","Colombia","Comoros","Congo (Brazzaville)","Congo (Kinshasa)","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
  "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada",
  "Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India",
  "Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan",
  "Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya",
  "Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
  "Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia",
  "Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand",
  "Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
  "Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
  "Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines",
  "Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles",
  "Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago",
  "Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen",
  "Zambia","Zimbabwe",
]

// ── Card brand detector ────────────────────────────────────────────────────────
function detectCardBrand(number: string): "visa" | "mastercard" | "amex" | "discover" | "unknown" {
  const n = number.replace(/\s/g, "")
  if (/^4/.test(n)) return "visa"
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard"
  if (/^3[47]/.test(n)) return "amex"
  if (/^6(?:011|5)/.test(n)) return "discover"
  return "unknown"
}

function formatCardNumber(value: string, brand: string): string {
  const digits = value.replace(/\D/g, "")
  if (brand === "amex") {
    return digits.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3").substring(0, 17)
  }
  return digits.replace(/(\d{4})/g, "$1 ").trim().substring(0, 19)
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (digits.length >= 3) return digits.substring(0, 2) + "/" + digits.substring(2, 4)
  return digits
}

// ── Card brand icons (inline SVG-ish badges) ──────────────────────────────────
function VisaIcon({ active }: { active?: boolean }) {
  return (
    <div className={`flex items-center justify-center px-2.5 py-1.5 border-2 transition-all ${active ? "border-[#1A1F71] bg-[#1A1F71]" : "border-gray-200 bg-white"}`} style={{ minWidth: 48, height: 32 }}>
      <svg viewBox="0 0 60 20" width="36" height="12" fill="none">
        <text x="0" y="16" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="18" fill={active ? "#FFD700" : "#1A1F71"}>VISA</text>
      </svg>
    </div>
  )
}
function MastercardIcon({ active }: { active?: boolean }) {
  return (
    <div className={`flex items-center justify-center px-2 py-1.5 border-2 transition-all ${active ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"}`} style={{ minWidth: 48, height: 32 }}>
      <svg viewBox="0 0 38 24" width="38" height="24">
        <circle cx="13" cy="12" r="10" fill="#EB001B" />
        <circle cx="25" cy="12" r="10" fill="#F79E1B" />
        <path d="M19 4.8a10 10 0 000 14.4A10 10 0 0019 4.8z" fill="#FF5F00" />
      </svg>
    </div>
  )
}
function AmexIcon({ active }: { active?: boolean }) {
  return (
    <div className={`flex items-center justify-center px-2.5 py-1.5 border-2 transition-all ${active ? "border-[#007BC1] bg-[#007BC1]" : "border-gray-200 bg-white"}`} style={{ minWidth: 48, height: 32 }}>
      <svg viewBox="0 0 60 20" width="40" height="14" fill="none">
        <text x="0" y="15" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="13" fill={active ? "white" : "#007BC1"} letterSpacing="1">AMEX</text>
      </svg>
    </div>
  )
}
function DiscoverIcon({ active }: { active?: boolean }) {
  return (
    <div className={`flex items-center justify-center px-2 py-1.5 border-2 transition-all ${active ? "border-orange-500 bg-orange-500" : "border-gray-200 bg-white"}`} style={{ minWidth: 48, height: 32 }}>
      <svg viewBox="0 0 70 20" width="52" height="16" fill="none">
        <text x="0" y="15" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="12" fill={active ? "white" : "#E65C1E"} letterSpacing="0.5">DISC</text>
        <circle cx="58" cy="10" r="8" fill={active ? "rgba(255,255,255,0.3)" : "#E65C1E"} />
        <circle cx="58" cy="10" r="5" fill={active ? "white" : "#FF6B2E"} />
      </svg>
    </div>
  )
}

// ── Visual credit card preview ─────────────────────────────────────────────────
function CardPreview({ number, name, expiry, brand }: { number: string; name: string; expiry: string; brand: string }) {
  const gradients: Record<string, string> = {
    visa: "linear-gradient(135deg, #1A1F71 0%, #2563EB 100%)",
    mastercard: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
    amex: "linear-gradient(135deg, #007BC1 0%, #00a8e8 100%)",
    discover: "linear-gradient(135deg, #E65C1E 0%, #f7971e 100%)",
    unknown: "linear-gradient(135deg, #111 0%, #333 100%)",
  }

  const displayNumber = number.replace(/\S(?=.{0,3}\s|.{0,3}$)/g, "•") || "•••• •••• •••• ••••"
  const maskedNumber = number
    ? number.padEnd(19, " ").replace(/(\S)/g, (c, i) => (i >= 10 ? c : "•"))
    : "•••• •••• •••• ••••"

  return (
    <div className="w-full rounded-none border-2 border-white/20 overflow-hidden relative select-none"
      style={{ background: gradients[brand] || gradients.unknown, height: 180, fontFamily: "'Courier New', monospace" }}>
      {/* Chip */}
      <div className="absolute top-5 left-5">
        <div className="w-9 h-7 bg-[#FFD000] rounded-sm border border-yellow-600 flex items-center justify-center">
          <div className="w-6 h-5 border border-yellow-600 rounded-sm grid grid-cols-2 gap-px p-0.5">
            <div className="bg-yellow-600/40 rounded-sm" /><div className="bg-yellow-600/40 rounded-sm" />
            <div className="bg-yellow-600/40 rounded-sm" /><div className="bg-yellow-600/40 rounded-sm" />
          </div>
        </div>
      </div>
      {/* Brand top-right */}
      <div className="absolute top-4 right-5 text-white font-black text-xs tracking-widest opacity-80 uppercase">
        {brand !== "unknown" ? brand : ""}
      </div>
      {/* Decorative circles */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute -right-2 -bottom-14 w-32 h-32 rounded-full bg-white/5" />
      {/* Card number */}
      <div className="absolute bottom-14 left-5 right-5 text-white text-lg font-bold tracking-[0.2em]">
        {number ? number.padEnd(19, " ").split("").map((c, i) =>
          <span key={i} className={c === " " ? "mr-2" : ""}>{c === " " ? "" : (i < 10 && number.replace(/\s/g, "").length > 4) ? "•" : c}</span>
        ) : <span className="opacity-40">•••• •••• •••• ••••</span>}
      </div>
      {/* Name + Expiry */}
      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
        <div>
          <p className="text-white/40 text-[8px] uppercase tracking-widest">Card Holder</p>
          <p className="text-white text-xs font-bold tracking-widest uppercase truncate max-w-[140px]">
            {name || "YOUR NAME"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-[8px] uppercase tracking-widest">Expires</p>
          <p className="text-white text-xs font-bold tracking-widest">
            {expiry || "MM/YY"}
          </p>
        </div>
      </div>
    </div>
  )
}

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

  // ── Guest fields (shown only when no session) ──────────────────────────────
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")

  // ── Payment / billing fields ───────────────────────────────────────────────
  const [phone, setPhone] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [zip, setZip] = useState("")
  const [country, setCountry] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardFlipped, setCardFlipped] = useState(false)

  const brand = detectCardBrand(cardNumber)

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

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
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

  const totalPrompts = pack.logoCount + pack.bannerCount + totalExtraPrompts
  const filledTotal = filledLogos + filledBanners + filledExtraTotal

  function updateLogoPrompt(index: number, value: string) {
    setLogoPrompts((prev) => { const u = [...prev]; u[index] = value; return u })
  }
  function updateBannerPrompt(index: number, value: string) {
    setBannerPrompts((prev) => { const u = [...prev]; u[index] = value; return u })
  }

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
      } catch { /* keep polling */ }
    }, 4000)
  }

  async function handleOrder() {
    if (!pack) return
    if (filledLogos === 0 && filledBanners === 0 && filledExtraTotal === 0) {
      setError("Please provide at least one prompt before placing your order.")
      return
    }

    // Validate payment fields
    if (!phone.trim()) { setError("Please enter your phone number."); return }
    if (!street.trim() || !city.trim() || !zip.trim() || !country) { setError("Please complete your billing address."); return }
    if (!cardNumber.replace(/\s/g, "") || cardNumber.replace(/\s/g, "").length < 13) { setError("Please enter a valid card number."); return }
    if (!cardName.trim()) { setError("Please enter the name on your card."); return }
    if (!expiry || expiry.length < 5) { setError("Please enter a valid expiry date."); return }
    if (!cvv || cvv.length < 3) { setError("Please enter your CVV."); return }
    if (!session && (!guestName.trim() || !guestEmail.trim())) {
      setError("Please enter your name and email."); return
    }

    setError("")
    setGenStatus("placing")

    try {
      const body: Record<string, any> = {
        packageSlug: slug,
        currency,
        notes,
        logoPrompts,
        bannerPrompts,
        extraPrompts,
        // Billing
        phone,
        billingAddress: { street, city, zip, country },
        // Card (in production you'd use a payment tokenizer — never raw card data to your own server)
        card: {
          number: cardNumber.replace(/\s/g, ""),
          name: cardName,
          expiry,
          cvv,
        },
      }

      // Only send name/email if no session
      if (!session) {
        body.guestName = guestName
        body.guestEmail = guestEmail
      }

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Order failed")

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

  // ── Input class helper ─────────────────────────────────────────────────────
  const inputCls = "w-full border-2 border-black bg-[#F5F0E8] px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FFD000] transition-all placeholder:text-gray-400 disabled:opacity-60"

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* ── Top bar ── */}
      <div className="bg-black py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#FFD000] flex items-center justify-center">
            <span className="text-black font-black text-xs">★</span>
          </div>
          <span className="font-black text-base tracking-widest uppercase text-white">Brief Lab Studio</span>
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
            <div className="flex border-2 border-black bg-white overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !isProcessing && setActiveTab(tab.id)}
                  disabled={isProcessing}
                  className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === tab.id
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
                        <span className={`w-5 h-5 flex items-center justify-center border-2 text-[10px] font-black ${prompt.trim() ? "bg-black text-[#FFD000] border-black" : "border-gray-300 text-gray-400"}`}>{i + 1}</span>
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
                <button onClick={() => setActiveTab("banners")} disabled={isProcessing}
                  className="w-full bg-black text-[#FFD000] py-3 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black disabled:opacity-50">
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
                        <span className={`w-5 h-5 flex items-center justify-center border-2 text-[10px] font-black ${prompt.trim() ? "bg-black text-[#FFD000] border-black" : "border-gray-300 text-gray-400"}`}>{i + 1}</span>
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
                  }} disabled={isProcessing}
                    className="flex-1 bg-black text-[#FFD000] py-3 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black disabled:opacity-50">
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ── Extra design tabs ── */}
            {pack.extraDesigns.map((design, di) =>
              activeTab === design.key ? (
                <div key={design.key} className="border-2 border-t-0 border-black bg-white p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{design.pluralLabel}</p>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                        Provide a prompt for each {design.label.toLowerCase()}. Describe style, colors, mood, and any specific text or elements you need.
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
                          <span className={`w-5 h-5 flex items-center justify-center border-2 text-[10px] font-black ${prompt.trim() ? "bg-black text-[#FFD000] border-black" : "border-gray-300 text-gray-400"}`}>{i + 1}</span>
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
                    <button onClick={() => setActiveTab(di === 0 ? "banners" : pack.extraDesigns[di - 1].key)} disabled={isProcessing}
                      className="flex-1 py-3 text-sm font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50">
                      ← Back
                    </button>
                    <button onClick={() => setActiveTab(di === pack.extraDesigns.length - 1 ? "details" : pack.extraDesigns[di + 1].key)} disabled={isProcessing}
                      className="flex-1 bg-black text-[#FFD000] py-3 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black disabled:opacity-50">
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
                        className={`px-4 py-2 text-sm font-black uppercase tracking-widest border-2 transition-colors disabled:opacity-50 ${currency === c.code ? "bg-black text-[#FFD000] border-black" : "bg-white text-black border-black hover:bg-[#F5F0E8]"}`}>
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
                  <button onClick={() => setActiveTab("payment")} disabled={isProcessing}
                    className="w-full bg-black text-[#FFD000] py-3 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black disabled:opacity-50">
                    Next: Payment →
                  </button>
                )}
              </div>
            )}

            {/* ── Tab: Payment ── */}
            {activeTab === "payment" && (
              <div className="border-2 border-t-0 border-black bg-white p-6 space-y-6">

                {/* ── Guest identity OR session identity ── */}
                {session ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Your Account</p>
                    <div className="grid grid-cols-2 gap-4 bg-[#F5F0E8] border-2 border-black p-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Name</p>
                        <p className="font-bold text-sm">{session.user?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
                        <p className="font-bold text-sm">{session.user?.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Details</p>
                      <span className="bg-[#FFD000] border border-black text-[9px] font-black uppercase px-2 py-0.5 tracking-widest">Guest</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name<span className="text-red-500 text-sm">*</span></label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          disabled={isProcessing}
                          placeholder="John Doe"
                          className={inputCls}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email Address<span className="text-red-500 text-sm">*</span></label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          disabled={isProcessing}
                          placeholder="john@example.com"
                          className={inputCls}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Phone ── */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Phone Number<span className="text-red-500 text-sm">*</span></label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isProcessing}
                    placeholder="+92 300 0000000"
                    className={inputCls}
                  />
                </div>

                {/* ── Billing Address ── */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Billing Address<span className="text-red-500 text-sm">*</span></label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      disabled={isProcessing}
                      placeholder="Street Address"
                      className={inputCls}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={isProcessing}
                        placeholder="City"
                        className={inputCls}
                      />
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        disabled={isProcessing}
                        placeholder="ZIP / Postal Code"
                        className={inputCls}
                      />
                    </div>
                    {/* Country dropdown */}
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        disabled={isProcessing}
                        className={`${inputCls} appearance-none cursor-pointer pr-10 ${!country ? "text-gray-400" : "text-black"}`}
                      >
                        <option value="" disabled>Select Country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {/* Chevron icon */}
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Card section ── */}
                <div className="border-2 border-black overflow-hidden">
                  {/* Header */}
                  <div className="bg-[#111] px-5 py-4 border-b-2 border-black">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Secure Payment</p>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black uppercase tracking-tight text-white">Pay with Card</h3>
                      <div className="flex items-center gap-1.5">
                        <VisaIcon active={brand === "visa"} />
                        <MastercardIcon active={brand === "mastercard"} />
                        <AmexIcon active={brand === "amex"} />
                        <DiscoverIcon active={brand === "discover"} />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-[#F5F0E8] space-y-4">
                    {/* Card preview */}
                    <CardPreview number={cardNumber} name={cardName} expiry={expiry} brand={brand} />

                    {/* Card Number */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value, brand))}
                          disabled={isProcessing}
                          placeholder="0000 0000 0000 0000"
                          maxLength={brand === "amex" ? 17 : 19}
                          className={`${inputCls} pr-12 font-mono tracking-widest`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
                          {brand === "visa" && <VisaIcon active />}
                          {brand === "mastercard" && <MastercardIcon active />}
                          {brand === "amex" && <AmexIcon active />}
                          {brand === "discover" && <DiscoverIcon active />}
                          {brand === "unknown" && (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Name on card */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Name on Card</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        disabled={isProcessing}
                        placeholder="JOHN DOE"
                        className={`${inputCls} uppercase tracking-widest font-mono`}
                      />
                    </div>

                    {/* Expiry + CVV */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Expiry Date</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          disabled={isProcessing}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`${inputCls} font-mono tracking-widest text-center`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5 block">
                          CVV
                          <span className="text-gray-400 normal-case font-medium text-[9px]">({brand === "amex" ? "4 digits" : "3 digits"})</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, brand === "amex" ? 4 : 3))}
                            onFocus={() => setCardFlipped(true)}
                            onBlur={() => setCardFlipped(false)}
                            disabled={isProcessing}
                            placeholder={brand === "amex" ? "••••" : "•••"}
                            maxLength={brand === "amex" ? 4 : 3}
                            className={`${inputCls} font-mono tracking-widest text-center`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SSL badge */}
                    <div className="flex items-center gap-2 pt-1">
                      <svg className="w-3.5 h-3.5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                        <rect x="3" y="7" width="10" height="8" rx="1" /><path d="M5 7V5a3 3 0 016 0v2" />
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-600">SSL Encrypted · 256-bit Secure</span>
                    </div>
                  </div>
                </div>

                {/* Back link */}
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
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-2 h-2 bg-[#FFD000] block animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD000]">
                        {genStatus === "placing" ? "Placing Order" : "AI Generating"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{generatingMessages[genStatus]}</p>
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
                    <span className="text-gray-300">
                      {session ? session.user?.email : guestEmail || "your email"}
                    </span>.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Processing overlay ── */}
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
              <p className="text-sm font-bold mt-1">All your files have been generated and sent to your email.</p>
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
                Your <strong>{pack.logoCount} logos and {pack.bannerCount} banners</strong> have been delivered to{" "}
                <strong>{session ? session.user?.email : guestEmail}</strong>. Check your inbox — the invoice PDF and all design files are attached.
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