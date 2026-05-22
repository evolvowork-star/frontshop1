import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/src/lib/auth"
import { prisma } from "@/src/lib/prisma"
import { convertPrice, getCurrencySymbol, type Currency } from "@/src/lib/currency"
import { generateInvoicePDF } from "@/src/lib/invoice-pdf"
import { sendOrderInvoiceEmail, sendAdminNewOrderEmail } from "@/src/lib/email-templates"
import { getPackageBySlug } from "@/src/lib/package"
import { decrypt } from "@/src/lib/encrypt"

// ─── Invoice number generator ────────────────────────────────────────────────
function generateInvoiceNo(): string {
  const d     = new Date()
  const year  = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const rand  = Math.floor(10000 + Math.random() * 90000)
  return `INV-${year}${month}-${rand}`
}

// ─── Sync package to DB ───────────────────────────────────────────────────────
async function upsertPackage(slug: string) {
  const p = getPackageBySlug(slug)
  if (!p) return null
  return prisma.package.upsert({
    where:  { slug },
    update: {
      name: p.name, tagline: p.tagline, description: p.description,
      priceEur: p.priceEur, features: p.features,
      deliveryDays: p.deliveryDays, theme: p.theme, isPopular: p.isPopular,
    },
    create: {
      slug: p.slug, name: p.name, tagline: p.tagline, description: p.description,
      priceEur: p.priceEur, features: p.features, deliveryDays: p.deliveryDays,
      theme: p.theme, isPopular: p.isPopular, isActive: true,
    },
  })
}

// ─── Get decrypted API key from DB ───────────────────────────────────────────
async function getOpenAIKey(): Promise<string> {
  const config = await prisma.aIConfig.findFirst({
    where:   { isActive: true, provider: "openai" },
    orderBy: { createdAt: "desc" },
  })
  if (!config) throw new Error("No active AI configuration found. Please connect an OpenAI API key from the admin dashboard.")
  return decrypt(config.apiKeyEnc)
}

// ─── Generate one image via gpt-image-1 ──────────────────────────────────────
async function generateImage(
  apiKey: string,
  prompt: string,
  type: "logo" | "banner",
  index: number,
): Promise<{ buffer: Buffer; filename: string }> {
  // logo = square, banner = landscape
  const size = type === "logo" ? "1024x1024" : "1536x1024"

  const systemContext = type === "logo"
    ? `You are a professional logo designer. Create a clean, professional, high-quality logo. The design must be on a white or transparent-friendly background. No text unless specified.`
    : `You are a professional banner designer. Create a wide-format marketing banner. The design must be visually striking and suitable for digital platforms.`

  const enhancedPrompt = `${systemContext}\n\nDesign request: ${prompt}`

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:   "gpt-image-1",
      prompt:  enhancedPrompt,
      n:       1,
      size,
      quality: "high",
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    console.error("[IMAGE_GEN_ERROR]", JSON.stringify(err))
    throw new Error(`Image generation error for ${type} ${index + 1}: ${err.error?.message ?? "Unknown error"}`)
  }

  const data = await res.json()

  // gpt-image-1 returns base64, not URL
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error(`No image data returned for ${type} ${index + 1}`)

  const buffer   = Buffer.from(b64, "base64")
  const filename = `${type}-${index + 1}.png`
  return { buffer, filename }
}

// ─── Generate all images (logos + banners) ───────────────────────────────────
async function generateAllImages(
  apiKey:        string,
  logoPrompts:   string[],
  bannerPrompts: string[],
  packageName:   string,
): Promise<{ buffer: Buffer; filename: string; type: "logo" | "banner" }[]> {
  const results: { buffer: Buffer; filename: string; type: "logo" | "banner" }[] = []

  const defaultLogoPrompt   = `A clean, professional, modern logo for a business called "${packageName}". Minimalist design, white background, bold typography.`
  const defaultBannerPrompt = `A professional wide-format digital marketing banner for a business called "${packageName}". Modern design, clean layout, vibrant colors.`

  // Generate logos sequentially to avoid rate limits
  for (let i = 0; i < logoPrompts.length; i++) {
    const prompt = logoPrompts[i].trim() || defaultLogoPrompt
    const result = await generateImage(apiKey, prompt, "logo", i)
    results.push({ ...result, type: "logo" })
  }

  // Generate banners sequentially
  for (let i = 0; i < bannerPrompts.length; i++) {
    const prompt = bannerPrompts[i].trim() || defaultBannerPrompt
    const result = await generateImage(apiKey, prompt, "banner", i)
    results.push({ ...result, type: "banner" })
  }

  return results
}

// ─── Calculate cost (approximate) ────────────────────────────────────────────
function calculateCost(logoCount: number, bannerCount: number): number {
  // gpt-image-1 approximate pricing
  const logoCost   = logoCount   * 0.04
  const bannerCost = bannerCount * 0.07
  return parseFloat((logoCost + bannerCost).toFixed(4))
}

// ─── Main POST handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse body
    const {
      packageSlug,
      currency      = "EUR",
      notes,
      logoPrompts   = [] as string[],
      bannerPrompts = [] as string[],
    } = await req.json()

    if (!packageSlug) {
      return NextResponse.json({ error: "packageSlug is required" }, { status: 400 })
    }

    // 3. Validate package
    const staticPack = getPackageBySlug(packageSlug)
    if (!staticPack) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // 4. Validate prompt counts
    if (logoPrompts.length !== staticPack.logoCount) {
      return NextResponse.json(
        { error: `Expected ${staticPack.logoCount} logo prompts, received ${logoPrompts.length}` },
        { status: 400 },
      )
    }
    if (bannerPrompts.length !== staticPack.bannerCount) {
      return NextResponse.json(
        { error: `Expected ${staticPack.bannerCount} banner prompts, received ${bannerPrompts.length}` },
        { status: 400 },
      )
    }

    // 5. Get user
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 6. Get AI API key
    let apiKey: string
    try {
      apiKey = await getOpenAIKey()
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 503 })
    }

    // 7. Sync package to DB
    const dbPackage = await upsertPackage(packageSlug)
    if (!dbPackage) {
      return NextResponse.json({ error: "Package sync failed" }, { status: 500 })
    }

    // 8. Prepare order details
    const selectedCurrency = currency as Currency
    const amount           = convertPrice(staticPack.priceEur, selectedCurrency)
    const currencySymbol   = getCurrencySymbol(selectedCurrency)

    // 9. Generate unique invoice number
    let invoiceNo = generateInvoiceNo()
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.subscription.findUnique({ where: { invoiceNo } })
      if (!exists) break
      invoiceNo = generateInvoiceNo()
    }

    // 10. Save subscription as PROCESSING
    const packageSnapshot = {
      slug:         staticPack.slug,
      name:         staticPack.name,
      tagline:      staticPack.tagline,
      description:  staticPack.description,
      features:     staticPack.features,
      deliveryDays: staticPack.deliveryDays,
      priceEur:     staticPack.priceEur,
      isPopular:    staticPack.isPopular,
      theme:        staticPack.theme,
      logoCount:    staticPack.logoCount,
      bannerCount:  staticPack.bannerCount,
      logoPrompts,
      bannerPrompts,
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId:          user.id,
        packageId:       dbPackage.id,
        packageSnapshot,
        currency:        selectedCurrency,
        amount,
        amountEur:       staticPack.priceEur,
        invoiceNo,
        notes:           notes || null,
        status:          "PROCESSING",
      },
    })

    // 11. Return invoiceNo immediately — frontend starts polling
    const responsePayload = { invoiceNo: subscription.invoiceNo }

    // ── Background job (non-blocking) ──────────────────────────────────────
    ;(async () => {
      try {
        // Generate all images
        const generatedImages = await generateAllImages(
          apiKey,
          logoPrompts,
          bannerPrompts,
          staticPack.name,
        )

        // Log AI usage
        const costUsd = calculateCost(staticPack.logoCount, staticPack.bannerCount)
        await prisma.aIUsageLog.create({
          data: {
            userId:      user.id,
            packageId:   dbPackage.id,
            packageSlug: staticPack.slug,
            packageName: staticPack.name,
            tokensIn:    0,
            tokensOut:   0,
            costUsd,
          },
        })

        // Build email data
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
          subscriptionId: subscription.id,
          createdAt:      subscription.createdAt,
          logoCount:      staticPack.logoCount,
          bannerCount:    staticPack.bannerCount,
        }

        // Generate invoice PDF
        const pdfBuffer = await generateInvoicePDF({
          ...emailData,
          tagline: staticPack.tagline,
        })

        // Prepare all generated images as email attachments
        const imageAttachments = generatedImages.map((img) => ({
          content:     img.buffer.toString("base64"),
          filename:    img.filename,
          type:        "image/png",
          disposition: "attachment" as const,
        }))

        // Send emails — user + admin, both get all images attached
        await Promise.all([
          sendOrderInvoiceEmail(emailData, pdfBuffer, imageAttachments),
          
        ])

        // Mark as COMPLETED
        await prisma.subscription.update({
          where: { id: subscription.id },
          data:  { status: "COMPLETED" },
        })

        console.log(`[ORDER_DONE] ${subscription.invoiceNo} — ${generatedImages.length} images sent to ${user.email}`)

      } catch (bgErr: any) {
        console.error("[ORDER_BACKGROUND_ERROR]", bgErr?.message ?? bgErr)
        await prisma.subscription.update({
          where: { id: subscription.id },
          data:  {
            status: "CANCELLED",
            notes:  `Generation failed: ${bgErr?.message ?? "Unknown error"}`,
          },
        }).catch(() => {})
      }
    })()

    return NextResponse.json(responsePayload, { status: 201 })

  } catch (error: any) {
    console.error("[ORDER_CREATE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}