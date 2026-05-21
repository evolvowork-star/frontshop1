// src/app/api/ai/generate/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Yeh user-facing API hai — user apna prompt bhejta hai,
// hum check karte hain uska package hai, phir OpenAI call karte hain,
// aur usage log karte hain.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/src/lib/admin-guard"
import { prisma } from "@/src/lib/prisma"   
import { decrypt } from "@/src/lib/encrypt"

// Cost per 1000 tokens (approximate gpt-4o / gpt-4.5)
const COST_PER_1K_IN  = 0.005   // $0.005 per 1K input tokens
const COST_PER_1K_OUT = 0.015   // $0.015 per 1K output tokens

export async function POST(req: NextRequest) {
  // ── 1. Auth check ──────────────────────────────────────────────────────
const {error, session} = await requireAdmin();
if (error) return error

  const userId    = (session?.user as any).id
  const userEmail = session?.user?.email!

  // ── 2. User ka active subscription check ──────────────────────────────
  const activeSub = await prisma.subscription.findFirst({
    where:   { userId, status: "COMPLETED" },
    include: { package: true },
    orderBy: { createdAt: "desc" },
  })

  if (!activeSub) {
    return NextResponse.json(
      { error: "No active package found. Please purchase a package first." },
      { status: 403 }
    )
  }

  // ── 3. Admin ka AI config check ───────────────────────────────────────
  const aiConfig = await prisma.aIConfig.findFirst({
    where: { isActive: true },
  })

  if (!aiConfig) {
    return NextResponse.json(
      { error: "AI generation is not available right now. Please contact support." },
      { status: 503 }
    )
  }

  // ── 4. Request body parse ─────────────────────────────────────────────
  const body = await req.json()
  const { prompt, type = "text" } = body as { prompt: string; type?: "text" | "image" }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
  }

  // ── 5. Decrypted key se OpenAI call ───────────────────────────────────
  const apiKey = decrypt(aiConfig.apiKeyEnc)
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type":  "application/json",
    ...(aiConfig.orgId ? { "OpenAI-Organization": aiConfig.orgId } : {}),
  }

  let resultText  = ""
  let tokensIn    = 0
  let tokensOut   = 0

  if (type === "image") {
    // ── DALL-E image generation ──────────────────────────────────────
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method:  "POST",
      headers,
      body: JSON.stringify({
        model:   "dall-e-3",
        prompt:  prompt.trim(),
        n:       1,
        size:    "1024x1024",
        quality: "standard",
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.error?.message ?? "Image generation failed." }, { status: 500 })
    }

    const data = await res.json()
    resultText = data.data?.[0]?.url ?? ""
    // DALL-E does not return token counts; use fixed estimate
    tokensIn  = 100
    tokensOut = 0

  } else {
    // ── Chat completion ───────────────────────────────────────────────
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method:  "POST",
      headers,
      body: JSON.stringify({
        model:      aiConfig.model,
        max_tokens: 1000,
        messages: [
          {
            role:    "system",
            content: "You are a professional designer assistant. Help users create logos, icons, and brand assets based on their descriptions.",
          },
          { role: "user", content: prompt.trim() },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.error?.message ?? "AI request failed." }, { status: 500 })
    }

    const data = await res.json()
    resultText = data.choices?.[0]?.message?.content ?? ""
    tokensIn   = data.usage?.prompt_tokens     ?? 0
    tokensOut  = data.usage?.completion_tokens ?? 0
  }

  // ── 6. Usage log karo ─────────────────────────────────────────────────
  const costUsd = (tokensIn / 1000) * COST_PER_1K_IN + (tokensOut / 1000) * COST_PER_1K_OUT

  await prisma.aIUsageLog.create({
    data: {
      userId,
      packageId:   activeSub.packageId,
      packageSlug: activeSub.package.slug,
      packageName: activeSub.package.name,
      tokensIn,
      tokensOut,
      costUsd,
    },
  })

  // ── 7. Response ────────────────────────────────────────────────────────
  return NextResponse.json({
    result: resultText,
    type,
    usage: { tokensIn, tokensOut, costUsd },
  })
}