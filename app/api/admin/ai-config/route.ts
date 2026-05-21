// src/app/api/admin/ai-config/route.ts

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/src/lib/admin-guard"
import { prisma } from "@/src/lib/prisma"              // apna prisma path
import { encrypt, decrypt, maskApiKey } from "@/src/lib/encrypt"

// ─── Helper: only ADMIN / SUPER_ADMIN pass kar sakein ────────────────────────


// ─── Helper: OpenAI key verify karo ──────────────────────────────────────────
async function verifyOpenAIKey(apiKey: string, orgId?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }
    if (orgId) headers["OpenAI-Organization"] = orgId

    const res = await fetch("https://api.openai.com/v1/models", { headers })
    return res.ok
  } catch {
    return false
  }
}

// ─── GET /api/admin/ai-config ─────────────────────────────────────────────────
// Current AI config fetch karo (key masked)
export async function GET() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const config = await prisma.aIConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })

  if (!config) {
    return NextResponse.json({ config: null })
  }

  return NextResponse.json({
    config: {
      id:           config.id,
      provider:     config.provider,
      model:        config.model,
      apiKeyMasked: config.apiKeyMasked,
      orgId:        config.orgId,
      isActive:     config.isActive,
      connectedAt:  config.createdAt,
      connectedBy:  config.connectedBy,
    },
  })
}

// ─── POST /api/admin/ai-config ────────────────────────────────────────────────
// Naya AI config save karo (key verify + encrypt)
export async function POST(req: NextRequest) {
  const {session} = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { apiKey, model, orgId } = body as {
    apiKey: string
    model:  string
    orgId?: string
  }

  if (!apiKey?.trim()) {
    return NextResponse.json({ error: "API key is required." }, { status: 400 })
  }

  // ── OpenAI se verify karo ──────────────────────────────────────────────
  const valid = await verifyOpenAIKey(apiKey.trim(), orgId?.trim())
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid API key. Verification failed with OpenAI." },
      { status: 400 }
    )
  }

  // ── Pehle wala config deactivate karo ─────────────────────────────────
  await prisma.aIConfig.updateMany({
    where: { isActive: true },
    data:  { isActive: false },
  })

  // ── Naya config save karo ─────────────────────────────────────────────
  const encrypted = encrypt(apiKey.trim())
  const masked    = maskApiKey(apiKey.trim())

  const newConfig = await prisma.aIConfig.create({
    data: {
      provider:     "openai",
      model:        model ?? "gpt-4.5-preview",
      apiKeyEnc:    encrypted,
      apiKeyMasked: masked,
      orgId:        orgId?.trim() || null,
      isActive:     true,
      connectedBy:  session.user?.email ?? "unknown",
    },
  })

  return NextResponse.json({
    config: {
      id:           newConfig.id,
      provider:     newConfig.provider,
      model:        newConfig.model,
      apiKeyMasked: newConfig.apiKeyMasked,
      orgId:        newConfig.orgId,
      isActive:     newConfig.isActive,
      connectedAt:  newConfig.createdAt,
      connectedBy:  newConfig.connectedBy,
    },
  })
}

// ─── DELETE /api/admin/ai-config ──────────────────────────────────────────────
// AI config disconnect karo
export async function DELETE() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.aIConfig.updateMany({
    where: { isActive: true },
    data:  { isActive: false },
  })

  return NextResponse.json({ success: true })
}

// ─── EXPORT: dusri APIs ke liye decrypted key lena ───────────────────────────
// Yeh function user-facing AI API use karegi
export async function getActiveAPIKey(): Promise<{ key: string; model: string; orgId: string | null } | null> {
  const config = await prisma.aIConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })
  if (!config) return null

  return {
    key:   decrypt(config.apiKeyEnc),
    model: config.model,
    orgId: config.orgId,
  }
}