// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server"

import { auth} from "@/src/lib/auth"
import { prisma } from "@/src/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = (session.user as any).role
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    totalSubscriptions,
    pendingSubscriptions,
    completedSubscriptions,
    revenueAgg,
    todayRevenueAgg,
    recentSubscriptions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: "PENDING" } }),
    prisma.subscription.count({ where: { status: "COMPLETED" } }),
    prisma.subscription.aggregate({
      _sum: { amountEur: true },
      where: { status: "COMPLETED" },
    }),
    prisma.subscription.aggregate({
      _sum: { amountEur: true },
      where: { status: "COMPLETED", createdAt: { gte: today } },
    }),
    prisma.subscription.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } },
        package: { select: { id: true, name: true, slug: true, theme: true } },
      },
    }),
  ])

  return NextResponse.json({
    totalUsers,
    totalSubscriptions,
    pendingSubscriptions,
    completedSubscriptions,
    revenueEur: revenueAgg._sum.amountEur ?? 0,
    revenueToday: todayRevenueAgg._sum.amountEur ?? 0,
    recentSubscriptions,
  })
}