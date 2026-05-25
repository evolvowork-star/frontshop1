"use client"
// app/login/page.tsx
import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    })
    setLoading(false)
    if (res?.error) {
      setError("Invalid email or password.")
    } else {
      window.location.href = callbackUrl
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      {/* Top bar */}
      <div className="bg-black text-[#FFD000] py-4 px-6 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#FFD000] border-2 border-[#FFD000] flex items-center justify-center">
            <span className="text-black font-black text-xs">★</span>
          </div>
          <span className="font-black text-base tracking-widest uppercase text-white">Brief Lab Studio</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <div className="inline-block border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
              ★ Account
            </div>
            <h1 className="text-5xl font-black uppercase leading-none tracking-tighter">
              SIGN
            </h1>
            <h2 className="text-5xl font-black italic leading-none tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}>
              in.
            </h2>
            {callbackUrl !== "/" && (
              <p className="mt-3 text-sm text-gray-600">
                Login to continue to your selected pack.
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-2 border-red-500 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#FFD000] focus:bg-[#FFFBE6] transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#FFD000] focus:bg-[#FFFBE6] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-[#FFD000] py-4 text-sm font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-colors border-2 border-black disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600">
            No account?{" "}
            <Link
              href={`/register${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-black underline hover:text-black"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F0E8]" />}>
      <LoginContent />
    </Suspense>
  )
}