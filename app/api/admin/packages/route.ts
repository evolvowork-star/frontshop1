// src/app/api/admin/packages/route.ts
import { NextResponse } from "next/server"

import { prisma } from "@/src/lib/prisma"
import { requireAdmin } from "@/src/lib/admin-guard"

export async function GET() {
  const {error, session } = await requireAdmin()
  if(error) return error;

  const packages = await prisma.package.findMany({
    orderBy: [{ isPopular: "desc" }, { priceEur: "asc" }],
    include: {
      _count: {
        select: { subscription: true },
      },
    },
  })

  return NextResponse.json({ packages })
}