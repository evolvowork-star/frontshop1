import { NextResponse } from "next/server"
import { auth } from "@/src/lib/auth"
import { prisma } from "@/src/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: {
        id:        true,
        name:      true,
        email:     true,
        image:     true,
        createdAt: true,
        subscription: {
          orderBy: { createdAt: "desc" },
          select: {
            id:              true,
            invoiceNo:       true,
            status:          true,
            currency:        true,
            amount:          true,
            amountEur:       true,
            packageSnapshot: true,
            notes:           true,
            createdAt:       true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Total spent in EUR across completed orders only
    const totalSpent = user.subscription
      .filter((s) => s.status === "COMPLETED")
      .reduce((sum, s) => sum + s.amountEur, 0)

    return NextResponse.json({
      user: {
        name:      user.name,
        email:     user.email,
        image:     user.image,
        createdAt: user.createdAt,
      },
      orders:     user.subscription,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
    })

  } catch (error) {
    console.error("[DASHBOARD_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}