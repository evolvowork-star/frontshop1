// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { requireAdmin } from "@/src/lib/admin-guard"

const PAGE_SIZE = 15

export async function GET(req: NextRequest) {
  const { error, session } = await requireAdmin()
    if (error) return error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")?.trim() ?? ""
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))

  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name:  { contains: search, mode: "insensitive" } },
        ],
      }
    : {}

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id:        true,
        name:      true,
        email:     true,
        image:     true,
        role:      true,
        createdAt: true,
        _count: {
          select: { subscription: true },
        },
      },
    }),
  ])

  return NextResponse.json({
    users,
    total,
    page,
    pages: Math.ceil(total / PAGE_SIZE),
  })
}