import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/src/lib/auth"
import { prisma } from "@/src/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoiceNo = req.nextUrl.searchParams.get("invoiceNo")
    if (!invoiceNo) {
      return NextResponse.json({ error: "invoiceNo is required" }, { status: 400 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { invoiceNo },
      select: { status: true, invoiceNo: true },
    })

    if (!subscription) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ status: subscription.status })
  } catch (error) {
    console.error("[ORDER_STATUS]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}