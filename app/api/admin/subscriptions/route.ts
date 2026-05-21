// src/app/api/admin/subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/src/lib/prisma"
import { requireAdmin } from "@/src/lib/admin-guard"
import { Prisma } from "@/generated/prisma/client"


const PAGE_SIZE = 15

export async function GET(req: NextRequest) {
    const { error } = await requireAdmin()
     if (error) return error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")?.trim() ?? ""
  const status = searchParams.get("status")?.trim() ?? ""
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))

  const where: Prisma.subscriptionWhereInput = {
    AND: [
      // Status filter
      status ? { status: status as any } : {},
      // Search across invoice number OR user email/name
      search
        ? {
            OR: [
              { invoiceNo: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
              { user: { name:  { contains: search, mode: "insensitive" } } },
            ],
          }
        : {},
    ],
  }

  const [total, subscriptions] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } },
        package: { select: { id: true, name: true, slug: true, theme: true } },
      },
    }),
  ])

  return NextResponse.json({
    subscriptions,
    total,
    page,
    pages: Math.ceil(total / PAGE_SIZE),
  })
}