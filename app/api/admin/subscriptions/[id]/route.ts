// src/app/api/admin/subscriptions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { requireAdmin } from "@/src/lib/admin-guard"

const VALID_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"] as const
type ValidStatus = typeof VALID_STATUSES[number]

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAdmin()
  if (error) return error

 

  const body = await req.json()
  const { status } = body

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
  }

  // Fetch existing to log the old status
  const existing = await prisma.subscription.findUnique({
    where: { id: params.id },
    select: { status: true, userId: true },
  })

  if (!existing) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
  }

  const [updated] = await prisma.$transaction([
    prisma.subscription.update({
      where: { id: params.id },
      data: { status: status as ValidStatus },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } },
        package: { select: { id: true, name: true, slug: true, theme: true } },
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId:    (session.user as any).id,
        action:     "UPDATE_STATUS",
        entityType: "subscription",
        entityId:   params.id,
        details: {
          from: existing.status,
          to:   status,
        },
      },
    }),
  ])

  return NextResponse.json({ subscription: updated })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
   const { error, session } = await requireAdmin()
  if (error) return error

  const subscription = await prisma.subscription.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, role: true } },
      package: { select: { id: true, name: true, slug: true, theme: true } },
    },
  })

  if (!subscription) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ subscription })
}