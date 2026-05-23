"use client"
// src/app/(admin)/admin/page.tsx

import { useEffect, useState, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminNavbar from "@/src/components/adminNavbar"

// ─── Types ────────────────────────────────────────────────────────────────────

type AIConfig = {
  id: string
  provider: string          // "openai"
  model: string             // "gpt-4.5-preview"
  apiKeyMasked: string      // "sk-...xxxx"
  orgId: string | null
  isActive: boolean
  connectedAt: string
  connectedBy: string
}
 
type AIUsageStat = {
  packageSlug: string
  packageName: string
  totalRequests: number
  totalTokensIn: number
  totalTokensOut: number
  estimatedCostUsd: number
  lastUsedAt: string | null
}
 
type AIUsageLog = {
  id: string
  userEmail: string
  packageName: string
  tokensIn: number
  tokensOut: number
  costUsd: number
  createdAt: string
}
 
type AIUsageOverview = {
  totalRequests: number
  totalTokens: number
  totalCostUsd: number
  byPackage: AIUsageStat[]
  recentLogs: AIUsageLog[]
}

type Stats = {
  totalUsers: number
  totalSubscriptions: number
  pendingSubscriptions: number
  completedSubscriptions: number
  revenueEur: number
  revenueToday: number
  recentSubscriptions: Subscription[]
}

type User = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: "USER" | "ADMIN" | "SUPER_ADMIN"
  createdAt: string
  _count: { subscription: number }
}

type PackageSnapshot = {
  slug: string
  name: string
  tagline: string
  description: string
  features: string[]
  deliveryDays: number
  priceEur: number
  isPopular: boolean
  theme: string
}

type Subscription = {
  id: string
  invoiceNo: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED"
  currency: string
  amount: number
  amountEur: number
  notes: string | null
  packageSnapshot: PackageSnapshot
  createdAt: string
  updatedAt: string
  user: { id: string; name: string | null; email: string; image: string | null; role: string }
  package: { id: string; name: string; slug: string; theme: string }
}

type Package = {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  priceEur: number
  features: string[]
  deliveryDays: number
  theme: string
  isPopular: boolean
  isActive: boolean
  _count: { subscription: number }
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtEur = (n: number) =>
  `€${n.toLocaleString("en-EU", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
const fmtAmt = (n: number, cur: string) =>
  `${cur === "EUR" ? "€" : cur === "USD" ? "$" : cur + " "}${n.toLocaleString()}`
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

function statusMeta(s: string) {
  if (s === "COMPLETED")  return { badge: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" }
  if (s === "PENDING")    return { badge: "bg-amber-100 text-amber-800",     dot: "bg-amber-400"   }
  if (s === "PROCESSING") return { badge: "bg-blue-100 text-blue-800",       dot: "bg-blue-500"    }
  if (s === "CANCELLED")  return { badge: "bg-red-100 text-red-800",         dot: "bg-red-500"     }
  return                         { badge: "bg-gray-100 text-gray-700",       dot: "bg-gray-400"    }
}

function roleMeta(r: string) {
  if (r === "SUPER_ADMIN") return "bg-amber-400 text-zinc-900"
  if (r === "ADMIN")       return "bg-blue-900 text-blue-200"
  return "bg-gray-100 text-gray-600"
}

function StatusBadge({ status }: { status: string }) {
  const m = statusMeta(status)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${m.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {status}
    </span>
  )
}

const TABLE_TH = "text-left px-5 py-3 text-[10px] font-mono text-gray-400 uppercase tracking-widest border-b border-gray-100"
const TABLE_TD = "px-5 py-4 border-b border-gray-50"

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState("overview")
  const [stats, setStats] = useState<Stats | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [aiConfig, setAiConfig]           = useState<AIConfig | null>(null)
  const [aiConfigLoading, setAiConfigLoading] = useState(false)
  const [aiForm, setAiForm] = useState({
    apiKey: "",
    orgId: "",
    model: "gpt-4.5-preview",
  })
  const [aiConnecting, setAiConnecting]   = useState(false)
  const [aiDisconnecting, setAiDisconnecting] = useState(false)
 
  const [aiUsage, setAiUsage]             = useState<AIUsageOverview | null>(null)
  const [aiUsageLoading, setAiUsageLoading] = useState(false)

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [subSearch, setSubSearch]   = useState("")
  const [subStatus, setSubStatus]   = useState("")
  const [userSearch, setUserSearch] = useState("")

  const [invoiceModal, setInvoiceModal] = useState<{ open: boolean; sub: Subscription | null }>({ open: false, sub: null })
  const [statusModal, setStatusModal]   = useState<{ open: boolean; sub: Subscription | null; newStatus: string }>({ open: false, sub: null, newStatus: "" })
  const [statusLoading, setStatusLoading] = useState(false)

  // ─── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.push("/login"); return }
    const role = (session.user as any).role
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") { router.push("/dashboard"); return }
  }, [session, status])

  // ─── Toast ────────────────────────────────────────────────────────────────
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const r = await fetch("/api/admin/stats")
    setStats(await r.json())
  }, [])

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ search: subSearch, status: subStatus, page: String(page) })
    const r = await fetch(`/api/admin/subscriptions?${p}`)
    const d = await r.json()
    setSubscriptions(d.subscriptions ?? [])
    setTotalPages(d.pages ?? 1)
    setLoading(false)
  }, [subSearch, subStatus, page])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ search: userSearch, page: String(page) })
    const r = await fetch(`/api/admin/users?${p}`)
    const d = await r.json()
    setUsers(d.users ?? [])
    setTotalPages(d.pages ?? 1)
    setLoading(false)
  }, [userSearch, page])

  const fetchAIConfig = useCallback(async () => {
    setAiConfigLoading(true)
    const r = await fetch("/api/admin/ai-config")
    const d = await r.json()
    setAiConfig(d.config ?? null)
    setAiConfigLoading(false)
  }, [])
 
  const fetchAIUsage = useCallback(async () => {
    setAiUsageLoading(true)
    const r = await fetch("/api/admin/ai-usage")
    const d = await r.json()
    setAiUsage(d ?? null)
    setAiUsageLoading(false)
  }, [])
 
  async function connectAI() {
    if (!aiForm.apiKey.trim()) return showToast("API key is required.", false)
    setAiConnecting(true)
    const res = await fetch("/api/admin/ai-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiForm),
    })
    setAiConnecting(false)
    if (res.ok) {
      showToast("AI model connected successfully.")
      setAiForm({ apiKey: "", orgId: "", model: "gpt-4.5-preview" })
      fetchAIConfig()
    } else {
      const e = await res.json()
      showToast(e.error ?? "Connection failed.", false)
    }
  }
 
  async function disconnectAI() {
    if (!confirm("Disconnect AI model? Users won't be able to generate images.")) return
    setAiDisconnecting(true)
    const res = await fetch("/api/admin/ai-config", { method: "DELETE" })
    setAiDisconnecting(false)
    if (res.ok) {
      showToast("AI model disconnected.")
      setAiConfig(null)
    } else {
      showToast("Failed to disconnect.", false)
    }
  }


  const fetchPackages = useCallback(async () => {
    setLoading(true)
    const r = await fetch("/api/admin/packages")
    const d = await r.json()
    setPackages(d.packages ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchStats() }, [])

  useEffect(() => {
    setPage(1)
    if (tab === "subscriptions") fetchSubscriptions()
    if (tab === "users")         fetchUsers()
    if (tab === "packages")      fetchPackages()
    if (tab === "ai-connect") fetchAIConfig()
    if (tab === "ai-usage")   fetchAIUsage()
  }, [tab])

  useEffect(() => {
    const t = setTimeout(() => { if (tab === "subscriptions") fetchSubscriptions() }, 350)
    return () => clearTimeout(t)
  }, [subSearch, subStatus])

  useEffect(() => {
    const t = setTimeout(() => { if (tab === "users") fetchUsers() }, 350)
    return () => clearTimeout(t)
  }, [userSearch])

  useEffect(() => {
    if (tab === "subscriptions") fetchSubscriptions()
    if (tab === "users")         fetchUsers()
  }, [page])

  // ─── Update Status ────────────────────────────────────────────────────────
  async function saveStatus() {
    if (!statusModal.sub) return
    setStatusLoading(true)
    const res = await fetch(`/api/admin/subscriptions/${statusModal.sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: statusModal.newStatus }),
    })
    setStatusLoading(false)
    if (res.ok) {
      setStatusModal({ open: false, sub: null, newStatus: "" })
      showToast("Status updated successfully.")
      fetchSubscriptions()
      fetchStats()
    } else {
      const e = await res.json()
      showToast(e.error ?? "An error occurred.", false)
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-sm font-mono text-gray-400">Authenticating...</p>
      </div>
    )
  }

  const navItems = [
    { key: "overview",      label: "OVERVIEW",      badge: null },
    { key: "subscriptions", label: "Orders", badge: stats?.pendingSubscriptions ?? null },
    { key: "users",         label: "USERS",         badge: null },
    { key: "packages",      label: "PACKAGES",      badge: null },
    { key: "ai-connect", label: "AI MODEL", badge: aiConfig?.isActive ? "●" : null },
    { key: "ai-usage",   label: "AI USAGE", badge: null },
  ]
  function AIConnectTab({
  aiConfig,
  aiConfigLoading,
  aiForm,
  setAiForm,
  aiConnecting,
  aiDisconnecting,
  connectAI,
  disconnectAI,
}: {
  aiConfig: AIConfig | null
  aiConfigLoading: boolean
  aiForm: { apiKey: string; orgId: string; model: string }
  setAiForm: (f: any) => void
  aiConnecting: boolean
  aiDisconnecting: boolean
  connectAI: () => void
  disconnectAI: () => void
}) {
  const SUPPORTED_MODELS = [
    { value: "gpt-5.5",    label: "GPT-5.5" },
    { value: "gpt-4o",             label: "GPT-4o" },
    { value: "gpt-4-turbo",        label: "GPT-4 Turbo" },
    { value: "dall-e-3",           label: "DALL·E 3  (image generation)" },
  ]
 
  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="font-['Anton',sans-serif] text-[40px] tracking-[0.04em] text-zinc-900 leading-none">
          AI MODEL
        </h1>
        <p className="text-[13px] font-mono text-gray-400 mt-1">
          Connect OpenAI to enable per-package AI generation for users
        </p>
      </div>
 
      {aiConfigLoading ? (
        <p className="text-[12px] font-mono text-gray-300">Loading configuration...</p>
      ) : aiConfig?.isActive ? (
        /* ── CONNECTED STATE ── */
        <div className="max-w-xl space-y-4">
 
          {/* Status card */}
          <div className="rounded-xl border-2 border-emerald-500 bg-white overflow-hidden">
            <div className="px-6 py-4 bg-emerald-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-white tracking-[0.15em] uppercase">
                  Model Connected
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-100">
                Since {new Date(aiConfig.connectedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
 
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {[
                { label: "Provider",   value: "OpenAI" },
                { label: "Model",      value: aiConfig.model },
                { label: "API Key",    value: aiConfig.apiKeyMasked },
                { label: "Org ID",     value: aiConfig.orgId ?? "—" },
                { label: "Connected By", value: aiConfig.connectedBy },
              ].map(row => (
                <div key={row.label}>
                  <p className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mb-1">{row.label}</p>
                  <p className="font-mono text-[13px] font-bold text-zinc-900 truncate">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
 
          {/* Disconnect */}
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-red-800">Disconnect Model</p>
              <p className="text-[11px] font-mono text-red-400 mt-0.5">
                Users will lose AI generation access immediately
              </p>
            </div>
            <button
              onClick={disconnectAI}
              disabled={aiDisconnecting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-[11px] font-mono font-bold tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {aiDisconnecting ? "Disconnecting..." : "DISCONNECT →"}
            </button>
          </div>
 
          {/* Per-Package Access Info */}
          
        </div>
 
      ) : (
        /* ── CONNECT FORM ── */
        <div className="max-w-xl space-y-4">
 
          {/* Info Banner */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex gap-3">
            <span className="text-amber-400 text-lg flex-shrink-0">⚡</span>
            <div>
              <p className="text-[12px] font-semibold text-amber-900">No AI model connected</p>
              <p className="text-[11px] font-mono text-amber-600 mt-0.5">
                Connect OpenAI once — all package users will get AI access based on their tier.
              </p>
            </div>
          </div>
 
          {/* Form Card */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <p className="font-['Anton',sans-serif] text-[16px] tracking-[0.05em] text-zinc-900">
                CONNECT OPENAI
              </p>
            </div>
 
            <div className="px-6 py-5 space-y-4">
 
              {/* API Key */}
              <div>
                <label className="block text-[10px] font-mono text-gray-400 tracking-[0.12em] uppercase mb-2">
                  OpenAI API Key <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={aiForm.apiKey}
                  onChange={e => setAiForm({ ...aiForm, apiKey: e.target.value })}
                  placeholder="sk-proj-..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm font-mono border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
                <p className="mt-1 text-[10px] font-mono text-gray-300">
                  Get your key from platform.openai.com/api-keys — stored encrypted
                </p>
              </div>
 
              {/* Model */}
              <div>
                <label className="block text-[10px] font-mono text-gray-400 tracking-[0.12em] uppercase mb-2">
                  Model
                </label>
                <select
                  value={aiForm.model}
                  onChange={e => setAiForm({ ...aiForm, model: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm font-mono border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-amber-400 transition"
                >
                  {SUPPORTED_MODELS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
 
              {/* Org ID (optional) */}
              <div>
                <label className="block text-[10px] font-mono text-gray-400 tracking-[0.12em] uppercase mb-2">
                  Organization ID <span className="text-gray-300">(optional)</span>
                </label>
                <input
                  type="text"
                  value={aiForm.orgId}
                  onChange={e => setAiForm({ ...aiForm, orgId: e.target.value })}
                  placeholder="org-xxxxxxxxxxxx"
                  className="w-full rounded-lg px-3 py-2.5 text-sm font-mono border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>
            </div>
 
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <p className="text-[10px] font-mono text-gray-300">
                Key is verified against OpenAI before saving
              </p>
              <button
                onClick={connectAI}
                disabled={aiConnecting || !aiForm.apiKey.trim()}
                className="px-5 py-2.5 rounded-lg bg-zinc-900 text-amber-400 text-[11px] font-mono font-bold tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-40"
              >
                {aiConnecting ? "CONNECTING..." : "CONNECT MODEL →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
 
 
// ──────────────────────────────────────────────────────────────────────────────
// AI USAGE TAB
// ──────────────────────────────────────────────────────────────────────────────
 
function AIUsageTab({
  aiUsage,
  aiUsageLoading,
}: {
  aiUsage: AIUsageOverview | null
  aiUsageLoading: boolean
}) {
  const fmtCost = (n: number) => `$${n.toFixed(4)}`
  const fmtNum  = (n: number) => n.toLocaleString()
 
  if (aiUsageLoading) {
    return (
      <div>
        <h1 className="font-['Anton',sans-serif] text-[40px] tracking-[0.04em] text-zinc-900 leading-none mb-2">
          AI USAGE
        </h1>
        <p className="text-[12px] font-mono text-gray-300">Loading usage data...</p>
      </div>
    )
  }
 
  const TABLE_TH = "text-left px-5 py-3 text-[10px] font-mono text-gray-400 uppercase tracking-widest border-b border-gray-100"
  const TABLE_TD = "px-5 py-4 border-b border-gray-50"
 
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Anton',sans-serif] text-[40px] tracking-[0.04em] text-zinc-900 leading-none">
          AI USAGE
        </h1>
        <p className="text-[13px] font-mono text-gray-400 mt-1">
          Token consumption and cost breakdown per package
        </p>
      </div>
 
      {!aiUsage ? (
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-12 text-center">
          <p className="text-[13px] font-mono text-gray-300">No usage data yet.</p>
          <p className="text-[11px] font-mono text-gray-200 mt-1">Data appears once users start generating.</p>
        </div>
      ) : (
        <div className="space-y-6">
 
          {/* ── Top stat cards ── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Requests",  value: fmtNum(aiUsage.totalRequests),  dark: true  },
              { label: "Total Tokens",    value: fmtNum(aiUsage.totalTokens),    dark: false },
              { label: "Estimated Cost",  value: `$${aiUsage.totalCostUsd.toFixed(2)}`, dark: false },
            ].map(s => (
              <div
                key={s.label}
                className={`rounded-xl p-5 border ${s.dark ? "bg-zinc-900 border-zinc-900" : "bg-white border-gray-200"}`}
              >
                <p className={`text-[10px] font-mono tracking-[0.12em] uppercase mb-2 ${s.dark ? "text-amber-400" : "text-gray-400"}`}>
                  {s.label}
                </p>
                <p className={`font-['Anton',sans-serif] text-[30px] leading-none ${s.dark ? "text-amber-400" : "text-zinc-900"}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
 
          {/* ── Per-Package Breakdown ── */}
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-gray-100">
              <span className="font-['Anton',sans-serif] text-base tracking-[0.05em] text-zinc-900">
                USAGE BY PACKAGE
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Package", "Requests", "Tokens In", "Tokens Out", "Est. Cost", "Last Used"].map(h => (
                    <th key={h} className={TABLE_TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aiUsage.byPackage.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-[13px] text-gray-300">
                      No package usage recorded.
                    </td>
                  </tr>
                ) : aiUsage.byPackage.map(pkg => (
                  <tr key={pkg.packageSlug} className="hover:bg-amber-50 transition-colors">
                    <td className={TABLE_TD}>
                      <p className="font-semibold text-[13px] text-zinc-900">{pkg.packageName}</p>
                      <p className="font-mono text-[10px] text-gray-400">{pkg.packageSlug}</p>
                    </td>
                    <td className={`${TABLE_TD} font-['Anton',sans-serif] text-[20px] text-zinc-900`}>
                      {fmtNum(pkg.totalRequests)}
                    </td>
                    <td className={`${TABLE_TD} font-mono text-[12px] text-gray-600`}>
                      {fmtNum(pkg.totalTokensIn)}
                    </td>
                    <td className={`${TABLE_TD} font-mono text-[12px] text-gray-600`}>
                      {fmtNum(pkg.totalTokensOut)}
                    </td>
                    <td className={`${TABLE_TD} font-mono text-[12px] font-bold text-zinc-900`}>
                      {fmtCost(pkg.estimatedCostUsd)}
                    </td>
                    <td className={`${TABLE_TD} font-mono text-[11px] text-gray-400`}>
                      {pkg.lastUsedAt
                        ? new Date(pkg.lastUsedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          {/* ── Recent Logs ── */}
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-gray-100">
              <span className="font-['Anton',sans-serif] text-base tracking-[0.05em] text-zinc-900">
                RECENT REQUESTS
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["User", "Package", "Tokens In", "Tokens Out", "Cost", "Time"].map(h => (
                    <th key={h} className={TABLE_TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aiUsage.recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-[13px] text-gray-300">
                      No requests yet.
                    </td>
                  </tr>
                ) : aiUsage.recentLogs.map(log => (
                  <tr key={log.id} className="hover:bg-amber-50 transition-colors">
                    <td className={`${TABLE_TD} font-mono text-[12px] text-gray-600`}>{log.userEmail}</td>
                    <td className={`${TABLE_TD} text-[13px] font-semibold text-zinc-900`}>{log.packageName}</td>
                    <td className={`${TABLE_TD} font-mono text-[12px] text-gray-500`}>{fmtNum(log.tokensIn)}</td>
                    <td className={`${TABLE_TD} font-mono text-[12px] text-gray-500`}>{fmtNum(log.tokensOut)}</td>
                    <td className={`${TABLE_TD} font-mono text-[11px] font-bold text-zinc-900`}>{fmtCost(log.costUsd)}</td>
                    <td className={`${TABLE_TD} font-mono text-[11px] text-gray-400`}>
                      {new Date(log.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
        </div>
      )}
    </div>
  )
}

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-sans">
      <AdminNavbar />
       <div className="flex flex-1 overflow-hidden">

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-semibold text-white ${toast.ok ? "bg-zinc-900" : "bg-red-600"}`}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="flex flex-col min-h-screen flex-shrink-0 w-56 bg-zinc-900 border-r border-zinc-800">
        {/* Logo */}
        

        {/* Nav */}
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`w-full text-left flex items-center justify-between px-6 py-2.5 text-[11px] font-mono font-semibold tracking-widest uppercase transition-all border-l-2 ${
                tab === item.key
                  ? "text-amber-400 bg-zinc-800 border-amber-400"
                  : "text-zinc-500 bg-transparent border-transparent hover:text-zinc-300"
              }`}
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span className="bg-amber-400 text-zinc-900 rounded-full text-[10px] px-1.5 py-0.5 font-bold leading-none">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-zinc-800">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase hover:text-red-400 transition-colors"
          >
            Sign Out →
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto px-10 py-9">

        {/* ════ OVERVIEW ══════════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div>
            <div className="mb-8">
              <h1 className="font-['Anton',sans-serif] text-[40px] tracking-[0.04em] text-zinc-900 leading-none">
                OVERVIEW
              </h1>
              <p className="text-[13px] font-mono text-gray-400 mt-1">
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            {/* Stat Cards — top row */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[
                { label: "Total Revenue",     value: stats ? fmtEur(stats.revenueEur) : "—",                    dark: true  },
                { label: "Total Orders",      value: stats?.totalSubscriptions?.toLocaleString() ?? "—",        dark: false },
                { label: "Registered Users",  value: stats?.totalUsers?.toLocaleString() ?? "—",               dark: false },
                { label: "Revenue Today",     value: stats ? fmtEur(stats.revenueToday) : "—",                  dark: false },
              ].map(s => (
                <div
                  key={s.label}
                  className={`rounded-xl p-5 border ${s.dark ? "bg-zinc-900 border-zinc-900" : "bg-white border-gray-200"}`}
                >
                  <p className={`text-[10px] font-mono tracking-[0.12em] uppercase mb-2 ${s.dark ? "text-amber-400" : "text-gray-400"}`}>
                    {s.label}
                  </p>
                  <p className={`font-['Anton',sans-serif] text-[30px] leading-none ${s.dark ? "text-amber-400" : "text-zinc-900"}`}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Status row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Pending Orders",   value: stats?.pendingSubscriptions ?? "—",   color: "text-amber-500" },
                { label: "Completed Orders", value: stats?.completedSubscriptions ?? "—", color: "text-emerald-600" },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-5 border bg-white border-gray-200">
                  <p className="text-[10px] font-mono tracking-[0.12em] uppercase text-gray-400 mb-2">{s.label}</p>
                  <p className={`font-['Anton',sans-serif] text-[28px] leading-none ${s.color}`}>
                    {String(s.value)}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Subscriptions */}
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <span className="font-['Anton',sans-serif] text-base tracking-[0.05em] text-zinc-900">RECENT ORDERS</span>
                <button
                  onClick={() => setTab("subscriptions")}
                  className="text-[11px] font-mono text-amber-400 bg-zinc-900 px-3 py-1.5 rounded-md tracking-wider hover:bg-zinc-800 transition-colors"
                >
                  View All →
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {["Invoice", "Customer", "Package", "Amount", "Status", "Date"].map(h => (
                      <th key={h} className={TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentSubscriptions ?? []).map(s => (
                    <tr
                      key={s.id}
                      className="hover:bg-amber-50 transition-colors cursor-pointer"
                      onClick={() => setInvoiceModal({ open: true, sub: s })}
                    >
                      <td className={`${TABLE_TD} font-mono text-xs font-bold text-zinc-900`}>{s.invoiceNo}</td>
                      <td className={TABLE_TD}>
                        <div className="font-semibold text-[13px] text-zinc-900">{s.user.name ?? "—"}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{s.user.email}</div>
                      </td>
                      <td className={`${TABLE_TD} text-[13px] text-gray-700 font-medium`}>
                        {s.packageSnapshot?.name ?? s.package?.name}
                      </td>
                      <td className={`${TABLE_TD} font-mono text-[13px] font-bold text-zinc-900`}>
                        {fmtAmt(s.amount, s.currency)}
                      </td>
                      <td className={TABLE_TD}><StatusBadge status={s.status} /></td>
                      <td className={`${TABLE_TD} font-mono text-[11px] text-gray-400`}>{fmtDate(s.createdAt)}</td>
                    </tr>
                  ))}
                  {!stats?.recentSubscriptions?.length && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-[13px] text-gray-300">
                        No Orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ SUBSCRIPTIONS ═════════════════════════════════════════════════ */}
        {tab === "subscriptions" && (
          <div>
            <div className="mb-6">
              <h1 className="font-['Anton',sans-serif] text-[40px] tracking-[0.04em] text-zinc-900 leading-none">
                Orders
              </h1>
              <p className="text-[13px] font-mono text-gray-400 mt-1">
                All purchases — invoices, packages, and statuses
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5 flex-wrap">
              <input
                value={subSearch}
                onChange={e => setSubSearch(e.target.value)}
                placeholder="Search by invoice no. or email..."
                className="flex-1 min-w-[220px] rounded-lg px-3 py-2 text-sm border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              />
              <select
                value={subStatus}
                onChange={e => setSubStatus(e.target.value)}
                className="rounded-lg px-3 py-2 text-xs font-mono border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-amber-400 transition"
              >
                <option value="">All Statuses</option>
                {["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {["Invoice No.", "Customer", "Package", "Amount Paid", "Amount EUR", "Status", "Date", "Actions"].map(h => (
                      <th key={h} className={TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-[12px] font-mono text-gray-300">Loading records...</td>
                    </tr>
                  ) : subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-[12px] font-mono text-gray-300">No records found.</td>
                    </tr>
                  ) : subscriptions.map(s => (
                    <tr key={s.id} className="hover:bg-amber-50 transition-colors">
                      <td className={`${TABLE_TD} font-mono text-xs font-bold text-zinc-900`}>{s.invoiceNo}</td>
                      <td className={TABLE_TD}>
                        <div className="font-semibold text-[13px] text-zinc-900">{s.user.name ?? "—"}</div>
                        <div className="text-[11px] font-mono text-gray-400">{s.user.email}</div>
                      </td>
                      <td className={TABLE_TD}>
                        <div className="font-semibold text-[13px] text-zinc-900">{s.packageSnapshot?.name ?? s.package?.name}</div>
                        <div className="text-[11px] text-gray-400">{s.packageSnapshot?.tagline}</div>
                      </td>
                      <td className={`${TABLE_TD} font-mono text-[13px] font-bold text-zinc-900`}>
                        {fmtAmt(s.amount, s.currency)}
                        <br />
                        <span className="text-[10px] text-gray-400 font-normal">{s.currency}</span>
                      </td>
                      <td className={`${TABLE_TD} font-mono text-[12px] text-gray-500`}>{fmtEur(s.amountEur)}</td>
                      <td className={TABLE_TD}><StatusBadge status={s.status} /></td>
                      <td className={`${TABLE_TD} font-mono text-[11px] text-gray-400`}>{fmtDate(s.createdAt)}</td>
                      <td className={TABLE_TD}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setInvoiceModal({ open: true, sub: s })}
                            className="rounded-lg px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            INVOICE
                          </button>
                          {/* <button
                            onClick={() => setStatusModal({ open: true, sub: s, newStatus: s.status })}
                            className="rounded-lg px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider bg-zinc-900 text-amber-400 hover:bg-zinc-800 transition-colors"
                          >
                            STATUS
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <span className="text-[11px] font-mono text-gray-400">Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ USERS ═════════════════════════════════════════════════════════ */}
        {tab === "users" && (
          <div>
            <div className="mb-6">
              <h1 className="font-['Anton',sans-serif] text-[40px] tracking-[0.04em] text-zinc-900 leading-none">
                USERS
              </h1>
              <p className="text-[13px] font-mono text-gray-400 mt-1">
                Registered accounts and their assigned roles
              </p>
            </div>

            <div className="flex gap-3 mb-5">
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="flex-1 rounded-lg px-3 py-2 text-sm border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {["User", "Email", "Role", "Orders", "Joined"].map(h => (
                      <th key={h} className={TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-[12px] font-mono text-gray-300">Loading users...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-[13px] text-gray-300">No users found.</td>
                    </tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="hover:bg-amber-50 transition-colors">
                      <td className={TABLE_TD}>
                        <div className="flex items-center gap-3">
                          {u.image
                            ? <img src={u.image} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                            : (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-zinc-900 text-amber-400 font-['Anton',sans-serif]">
                                {(u.name ?? u.email)[0].toUpperCase()}
                              </div>
                            )
                          }
                          <span className="font-semibold text-[13px] text-zinc-900">{u.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className={`${TABLE_TD} font-mono text-[12px] text-gray-500`}>{u.email}</td>
                      <td className={TABLE_TD}>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold font-mono tracking-wide ${roleMeta(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className={TABLE_TD}>
                        <span className={`font-['Anton',sans-serif] text-xl ${u._count.subscription > 0 ? "text-zinc-900" : "text-gray-200"}`}>
                          {u._count.subscription}
                        </span>
                      </td>
                      <td className={`${TABLE_TD} font-mono text-[11px] text-gray-400`}>{fmtDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <span className="text-[11px] font-mono text-gray-400">Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ PACKAGES ══════════════════════════════════════════════════════ */}
        {tab === "packages" && (
          <div>
            <div className="mb-6">
              <h1 className="font-['Anton',sans-serif] text-[40px] tracking-[0.04em] text-zinc-900 leading-none">
                PACKAGES
              </h1>
              <p className="text-[13px] font-mono text-gray-400 mt-1">
                Live service packages pulled from the database
              </p>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {loading ? (
                <p className="text-[12px] font-mono text-gray-300 p-5">Loading packages...</p>
              ) : packages.map(p => (
                <div
                  key={p.id}
                  className={`rounded-xl border overflow-hidden ${p.theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}
                >
                  {/* Header */}
                  <div className={`px-5 py-4 border-b ${p.theme === "dark" ? "border-zinc-800" : "border-gray-100"}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        {p.isPopular && (
                          <span className="inline-block mb-2 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide bg-amber-400 text-zinc-900">
                            ★ MOST POPULAR
                          </span>
                        )}
                        <h3 className={`font-['Anton',sans-serif] text-[22px] tracking-[0.04em] leading-tight ${p.theme === "dark" ? "text-amber-400" : "text-zinc-900"}`}>
                          {p.name.toUpperCase()}
                        </h3>
                        <p className={`text-[12px] mt-0.5 ${p.theme === "dark" ? "text-zinc-500" : "text-gray-400"}`}>
                          {p.tagline}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-mono font-semibold ${p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                        {p.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-4">
                    <div className="flex items-end gap-2 mb-4">
                      <span className={`font-['Anton',sans-serif] text-[36px] leading-none ${p.theme === "dark" ? "text-white" : "text-zinc-900"}`}>
                        €{p.priceEur}
                      </span>
                      <span className={`text-[11px] font-mono mb-1 ${p.theme === "dark" ? "text-zinc-600" : "text-gray-400"}`}>
                        one-time · {p.deliveryDays} days
                      </span>
                    </div>

                    <ul className="space-y-1.5 mb-4">
                      {p.features.map((f, i) => (
                        <li key={i} className={`flex items-start gap-2 text-[12px] ${p.theme === "dark" ? "text-zinc-400" : "text-gray-500"}`}>
                          <span className="text-amber-400 flex-shrink-0 mt-0.5">✦</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className={`pt-3 border-t flex items-center justify-between ${p.theme === "dark" ? "border-zinc-800" : "border-gray-100"}`}>
                      <span className={`text-[10px] font-mono tracking-widest uppercase ${p.theme === "dark" ? "text-zinc-600" : "text-gray-400"}`}>
                        Total Orders
                      </span>
                      <span className={`font-['Anton',sans-serif] text-[22px] leading-none ${p.theme === "dark" ? "text-amber-400" : "text-zinc-900"}`}>
                        {p._count.subscription}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && packages.length === 0 && (
                <p className="text-[12px] font-mono text-gray-300 p-5">
                  No packages found. Create a subscription to trigger a package upsert.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "ai-connect" && (
  <AIConnectTab
    aiConfig={aiConfig}
    aiConfigLoading={aiConfigLoading}
    aiForm={aiForm}
    setAiForm={setAiForm}
    aiConnecting={aiConnecting}
    aiDisconnecting={aiDisconnecting}
    connectAI={connectAI}
    disconnectAI={disconnectAI}
  />
)}
{tab === "ai-usage" && (
  <AIUsageTab
    aiUsage={aiUsage}
    aiUsageLoading={aiUsageLoading}
  />
)}
      </main>

      {/* ════ INVOICE MODAL ═════════════════════════════════════════════════════ */}
      {invoiceModal.open && invoiceModal.sub && (() => {
        const s = invoiceModal.sub
        const snap = s.packageSnapshot
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-8 px-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-900 bg-stone-50">

              {/* Invoice Header */}
              <div className="px-8 py-6 bg-zinc-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-mono text-amber-400 tracking-[0.2em] uppercase mb-1.5">Invoice</p>
                    <p className="font-['Anton',sans-serif] text-[28px] text-white tracking-[0.04em]">{s.invoiceNo}</p>
                    <p className="font-mono text-[11px] text-zinc-500 mt-1">{fmtDate(s.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={s.status} />
                    <p className="font-['Anton',sans-serif] text-[32px] text-amber-400 mt-2 leading-none">
                      {fmtAmt(s.amount, s.currency)}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-500 mt-1">≈ {fmtEur(s.amountEur)} EUR</p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 space-y-4">

                {/* Customer */}
                <div className="rounded-xl p-4 border border-gray-200 bg-white">
                  <p className="text-[10px] font-mono text-gray-400 tracking-[0.12em] uppercase mb-3">Customer</p>
                  <div className="flex items-center gap-3">
                    {s.user.image
                      ? <img src={s.user.image} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-zinc-900 text-amber-400 font-['Anton',sans-serif]">
                          {(s.user.name ?? s.user.email)[0].toUpperCase()}
                        </div>
                      )
                    }
                    <div>
                      <p className="font-bold text-[14px] text-zinc-900">{s.user.name ?? "—"}</p>
                      <p className="font-mono text-[12px] text-gray-400">{s.user.email}</p>
                      <p className="font-mono text-[10px] text-gray-300 mt-0.5">ID: {s.user.id}</p>
                    </div>
                  </div>
                </div>

                {/* Package Snapshot */}
                <div className="rounded-xl p-4 border border-gray-200 bg-white">
                  <p className="text-[10px] font-mono text-gray-400 tracking-[0.12em] uppercase mb-3">
                    Package — at time of purchase
                  </p>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-['Anton',sans-serif] text-[20px] text-zinc-900 tracking-[0.04em]">
                        {snap?.name?.toUpperCase()}
                      </p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{snap?.tagline}</p>
                    </div>
                    <div className="text-right font-mono text-[11px] text-gray-500">
                      <p className="font-['Anton',sans-serif] text-[22px] text-zinc-900">€{snap?.priceEur}</p>
                      <p>{snap?.deliveryDays} days delivery</p>
                    </div>
                  </div>
                  {snap?.features && (
                    <ul className="space-y-1">
                      {snap.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-gray-500">
                          <span className="text-amber-400 flex-shrink-0">✦</span> {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Payment Details */}
                <div className="rounded-xl p-4 border border-gray-200 bg-white">
                  <p className="text-[10px] font-mono text-gray-400 tracking-[0.12em] uppercase mb-3">Payment Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Currency",     value: s.currency },
                      { label: "Amount Paid",  value: fmtAmt(s.amount, s.currency) },
                      { label: "Amount EUR",   value: fmtEur(s.amountEur) },
                      { label: "Invoice No.",  value: s.invoiceNo },
                    ].map(row => (
                      <div key={row.label}>
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">{row.label}</p>
                        <p className="font-bold text-[13px] font-mono text-zinc-900">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Note */}
                {s.notes && (
                  <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
                    <p className="text-[10px] font-mono text-amber-700 tracking-[0.12em] uppercase mb-2">Customer Note</p>
                    <p className="text-[13px] text-amber-900">{s.notes}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => {
                    setInvoiceModal({ open: false, sub: null })
                    setStatusModal({ open: true, sub: s, newStatus: s.status })
                  }}
                  className="text-[11px] font-mono text-zinc-900 tracking-wide underline underline-offset-2 hover:text-amber-600 transition-colors"
                >
                  
                </button>
                <button
                  onClick={() => setInvoiceModal({ open: false, sub: null })}
                  className="bg-zinc-900 text-amber-400 text-[11px] font-mono font-bold px-5 py-2 rounded-lg tracking-wider hover:bg-zinc-800 transition-colors"
                >
                  CLOSE ×
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ════ STATUS MODAL ══════════════════════════════════════════════════════ */}
      {statusModal.open && statusModal.sub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border-2 border-zinc-900 bg-stone-50">
            <div className="px-6 py-5 bg-zinc-900">
              <p className="text-[11px] font-mono text-amber-400 tracking-[0.2em] uppercase mb-1">Update Status</p>
              <p className="font-mono text-[13px] text-white">{statusModal.sub.invoiceNo}</p>
              <p className="font-mono text-[11px] text-zinc-500 mt-1">
                {statusModal.sub.user.name ?? statusModal.sub.user.email}
              </p>
            </div>

            <div className="px-6 py-6">
              <p className="text-[10px] font-mono text-gray-400 tracking-[0.12em] uppercase mb-3">Select New Status</p>
              <div className="grid grid-cols-2 gap-2">
                {["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"].map(st => {
                  const m = statusMeta(st)
                  const selected = statusModal.newStatus === st
                  return (
                    <button
                      key={st}
                      onClick={() => setStatusModal(prev => ({ ...prev, newStatus: st }))}
                      className={`rounded-xl py-3 text-center text-[11px] font-mono font-bold tracking-wide border-2 transition-all ${
                        selected
                          ? `${m.badge} border-current`
                          : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {st}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setStatusModal({ open: false, sub: null, newStatus: "" })}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[12px] font-mono font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveStatus}
                disabled={statusLoading}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-amber-400 text-[12px] font-mono font-bold tracking-wider disabled:opacity-50 hover:bg-zinc-800 transition-colors"
              >
                {statusLoading ? "Saving..." : "SAVE →"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}