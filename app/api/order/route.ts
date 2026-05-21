import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/src/lib/auth"
import { prisma } from "@/src/lib/prisma"
import { convertPrice, getCurrencySymbol, type Currency } from "@/src/lib/currency"
import { generateInvoicePDF } from "@/src/lib/invoice-pdf"
import { sendOrderInvoiceEmail, sendAdminNewOrderEmail } from "@/src/lib/email-templates"
import { getPackageBySlug } from "@/src/lib/package"

function generateInvoiceNo(): string {
  const d     = new Date()
  const year  = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const rand  = Math.floor(10000 + Math.random() * 90000)
  return `INV-${year}${month}-${rand}`
}

async function upsertPackage(slug: string) {
  const p = getPackageBySlug(slug)
  if (!p) return null
  return prisma.package.upsert({
    where:  { slug },
    update: { name: p.name, tagline: p.tagline, description: p.description,
               priceEur: p.priceEur, features: p.features,
               deliveryDays: p.deliveryDays, theme: p.theme, isPopular: p.isPopular },
    create: { slug: p.slug, name: p.name, tagline: p.tagline, description: p.description,
               priceEur: p.priceEur, features: p.features, deliveryDays: p.deliveryDays,
               theme: p.theme, isPopular: p.isPopular, isActive: true },
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { packageSlug, currency = "EUR", notes } = await req.json()
    if (!packageSlug) {
      return NextResponse.json({ error: "packageSlug is required" }, { status: 400 })
    }

    const staticPack = getPackageBySlug(packageSlug)
    if (!staticPack) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const dbPackage = await upsertPackage(packageSlug)
    if (!dbPackage) {
      return NextResponse.json({ error: "Package sync failed" }, { status: 500 })
    }

    const selectedCurrency = currency as Currency
    const amount           = convertPrice(staticPack.priceEur, selectedCurrency)
    const currencySymbol   = getCurrencySymbol(selectedCurrency)

    let invoiceNo = generateInvoiceNo()
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.subscription.findUnique({ where: { invoiceNo } })
      if (!exists) break
      invoiceNo = generateInvoiceNo()
    }

    const packageSnapshot = {
      slug: staticPack.slug, name: staticPack.name, tagline: staticPack.tagline,
      description: staticPack.description, features: staticPack.features,
      deliveryDays: staticPack.deliveryDays, priceEur: staticPack.priceEur,
      isPopular: staticPack.isPopular, theme: staticPack.theme,
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id, packageId: dbPackage.id, packageSnapshot,
        currency: selectedCurrency, amount, amountEur: staticPack.priceEur,
        invoiceNo, notes: notes || null, status: "COMPLETED",
      },
    })

    // Email data
    const emailData = {
      userName:       user.name ?? "Customer",
      userEmail:      user.email,
      invoiceNo:      subscription.invoiceNo,
      packageName:    staticPack.name,
      features:       staticPack.features,
      deliveryDays:   staticPack.deliveryDays,
      amount,
      currency:       selectedCurrency,
      currencySymbol,
      subscriptionId:        subscription.id,
      createdAt:      subscription.createdAt,
    }

    // Generate PDF then send both emails (non-blocking)
    generateInvoicePDF({
      ...emailData,
      tagline: staticPack.tagline,
    }).then((pdfBuffer) =>
      Promise.all([
        sendOrderInvoiceEmail(emailData, pdfBuffer),
        sendAdminNewOrderEmail(emailData, pdfBuffer),
      ])
    ).catch((err) => console.error("[ORDER_EMAIL_ERROR]", err))

    return NextResponse.json({ invoiceNo: subscription.invoiceNo }, { status: 201 })

  } catch (error: any) {
    console.error("[ORDER_CREATE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}