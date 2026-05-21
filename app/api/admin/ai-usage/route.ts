// src/app/api/admin/ai-usage/route.ts

import { NextResponse } from "next/server"

import { requireAdmin } from "@/src/lib/admin-guard"       // apna auth path
import { prisma } from "@/src/lib/prisma"          // apna prisma path

export async function GET() {
  
    const {error, session} = await requireAdmin()
    if (error) return error 

  // ── Total counts ────────────────────────────────────────────────────────
  const allLogs = await prisma.aIUsageLog.findMany({
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "desc" },
  })
 
  // ── Totals ───────────────────────────────────────────────────────────────
  const totalRequests = allLogs.length
  const totalTokens   = allLogs.reduce((s, l) => s + l.tokensIn + l.tokensOut, 0)
  const totalCostUsd  = allLogs.reduce((s, l) => s + l.costUsd, 0)
 
  // ── Per-Package breakdown ────────────────────────────────────────────────
  const pkgMap = new Map<string, {
    packageSlug:      string
    packageName:      string
    totalRequests:    number
    totalTokensIn:    number
    totalTokensOut:   number
    estimatedCostUsd: number
    lastUsedAt:       string | null
  }>()
 
  for (const log of allLogs) {
    const e = pkgMap.get(log.packageSlug)
    if (e) {
      e.totalRequests    += 1
      e.totalTokensIn    += log.tokensIn
      e.totalTokensOut   += log.tokensOut
      e.estimatedCostUsd += log.costUsd
      if (!e.lastUsedAt || log.createdAt > new Date(e.lastUsedAt))
        e.lastUsedAt = log.createdAt.toISOString()
    } else {
      pkgMap.set(log.packageSlug, {
        packageSlug:      log.packageSlug,
        packageName:      log.packageName,
        totalRequests:    1,
        totalTokensIn:    log.tokensIn,
        totalTokensOut:   log.tokensOut,
        estimatedCostUsd: log.costUsd,
        lastUsedAt:       log.createdAt.toISOString(),
      })
    }
  }
 
  // ── Per-User breakdown ───────────────────────────────────────────────────
  const userMap = new Map<string, {
    userId:           string
    userName:         string | null
    userEmail:        string
    userImage:        string | null
    packageName:      string
    totalRequests:    number
    totalTokensIn:    number
    totalTokensOut:   number
    estimatedCostUsd: number
    lastUsedAt:       string | null
  }>()
 
  for (const log of allLogs) {
    const e = userMap.get(log.userId)
    if (e) {
      e.totalRequests    += 1
      e.totalTokensIn    += log.tokensIn
      e.totalTokensOut   += log.tokensOut
      e.estimatedCostUsd += log.costUsd
      if (!e.lastUsedAt || log.createdAt > new Date(e.lastUsedAt)) {
        e.lastUsedAt  = log.createdAt.toISOString()
        e.packageName = log.packageName
      }
    } else {
      userMap.set(log.userId, {
        userId:           log.user.id,
        userName:         log.user.name,
        userEmail:        log.user.email,
        userImage:        log.user.image,
        packageName:      log.packageName,
        totalRequests:    1,
        totalTokensIn:    log.tokensIn,
        totalTokensOut:   log.tokensOut,
        estimatedCostUsd: log.costUsd,
        lastUsedAt:       log.createdAt.toISOString(),
      })
    }
  }
 
  // ── Recent 20 logs ───────────────────────────────────────────────────────
  const recentLogs = allLogs.slice(0, 20).map(l => ({
    id:          l.id,
    userId:      l.user.id,
    userName:    l.user.name,
    userEmail:   l.user.email,
    userImage:   l.user.image,
    packageName: l.packageName,
    tokensIn:    l.tokensIn,
    tokensOut:   l.tokensOut,
    costUsd:     l.costUsd,
    createdAt:   l.createdAt.toISOString(),
  }))
 
  return NextResponse.json({
    totalRequests,
    totalTokens,
    totalCostUsd,
    byPackage: Array.from(pkgMap.values()),
    byUser:    Array.from(userMap.values()),
    recentLogs,
  })
}