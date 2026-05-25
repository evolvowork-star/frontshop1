import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/src/lib/auth"
import { prisma } from "@/src/lib/prisma"
import { convertPrice, getCurrencySymbol, type Currency } from "@/src/lib/currency"
import { generateInvoicePDF } from "@/src/lib/invoice-pdf"
import { sendOrderInvoiceEmail, sendAdminNewOrderEmail } from "@/src/lib/email-templates"
import { getPackageBySlug, type DesignTypeConfig } from "@/src/lib/package"
import { decrypt } from "@/src/lib/encrypt"
import bcrypt from "bcryptjs"
import sharp from "sharp"

// ─── Invoice number generator ────────────────────────────────────────────────
function generateInvoiceNo(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `INV-${year}${month}-${rand}`
}

// ─── Sync package to DB ───────────────────────────────────────────────────────
async function upsertPackage(slug: string) {
  const p = getPackageBySlug(slug)
  if (!p) return null
  return prisma.package.upsert({
    where: { slug },
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
    where: { isActive: true, provider: "openai" },
    orderBy: { createdAt: "desc" },
  })
  if (!config) throw new Error("No active AI configuration found. Please connect an OpenAI API key from the admin dashboard.")
  return decrypt(config.apiKeyEnc)
}

// ─── Convert PNG buffer to JPEG buffer ───────────────────────────────────────
async function toJpeg(pngBuffer: Buffer): Promise<Buffer> {
  return sharp(pngBuffer)
    .jpeg({ quality: 95 })
    .toBuffer()
}

// ─── Generate one image via gpt-image-1 ──────────────────────────────────────
async function generateImage(
  apiKey: string,
  prompt: string,
  size: "1024x1024" | "1536x1024",
  systemContext: string,
  filename: string,
): Promise<{ buffer: Buffer; filename: string }> {
  const enhancedPrompt = `${systemContext}\n\nDesign request: ${prompt}`

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      n: 1,
      size,
      quality: "high",
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    console.error("[IMAGE_GEN_ERROR]", JSON.stringify(err))
    throw new Error(`Image generation error (${filename}): ${err.error?.message ?? "Unknown error"}`)
  }

  const data = await res.json()
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error(`No image data returned for ${filename}`)

  const buffer = Buffer.from(b64, "base64")
  return { buffer, filename }
}

// ─── Generate all images (logos + banners + extras) ──────────────────────────
async function generateAllImages(
  apiKey: string,
  logoPrompts: string[],
  bannerPrompts: string[],
  extraPrompts: Record<string, string[]>,
  packageName: string,
  extraDesigns: DesignTypeConfig[],
): Promise<{ buffer: Buffer; filename: string; type: string }[]> {
  const results: { buffer: Buffer; filename: string; type: string }[] = []

  const LOGO_CONTEXT = `You are a professional logo designer. Create a clean, professional, high-quality logo. White or transparent-friendly background. No text unless specified.`
  const BANNER_CONTEXT = `You are a professional banner designer. Create a wide-format marketing banner. Visually striking and suitable for digital platforms.`

  const defaultLogo = `A clean, professional, modern logo for a business called "${packageName}". Minimalist design, white background, bold typography.`
  const defaultBanner = `A professional wide-format digital marketing banner for "${packageName}". Modern design, clean layout, vibrant colors.`

  for (let i = 0; i < logoPrompts.length; i++) {
    const r = await generateImage(apiKey, logoPrompts[i].trim() || defaultLogo, "1024x1024", LOGO_CONTEXT, `logo-${i + 1}.png`)
    results.push({ ...r, type: "logo" })
  }

  for (let i = 0; i < bannerPrompts.length; i++) {
    const r = await generateImage(apiKey, bannerPrompts[i].trim() || defaultBanner, "1536x1024", BANNER_CONTEXT, `banner-${i + 1}.png`)
    results.push({ ...r, type: "banner" })
  }

  for (const design of extraDesigns) {
    const prompts = extraPrompts[design.key] ?? []
    const defaultPrompt = `A professional ${design.label.toLowerCase()} for a brand called "${packageName}". High quality, clean design.`
    for (let i = 0; i < design.count; i++) {
      const r = await generateImage(
        apiKey,
        (prompts[i] ?? "").trim() || defaultPrompt,
        design.imageSize,
        design.systemContext,
        `${design.key}-${i + 1}.png`,
      )
      results.push({ ...r, type: design.key })
    }
  }

  return results
}

// ─── Build email attachments: PNG + JPEG for every image ─────────────────────
async function buildImageAttachments(
  generatedImages: { buffer: Buffer; filename: string; type: string }[],
) {
  const attachments: {
    content: string
    filename: string
    type: string
    disposition: "attachment"
  }[] = []

  for (const img of generatedImages) {
    const baseName = img.filename.replace(".png", "")
    const jpegBuffer = await toJpeg(img.buffer)

    attachments.push({
      content: img.buffer.toString("base64"),
      filename: `${baseName}.png`,
      type: "image/png",
      disposition: "attachment",
    })

    attachments.push({
      content: jpegBuffer.toString("base64"),
      filename: `${baseName}.jpg`,
      type: "image/jpeg",
      disposition: "attachment",
    })
  }

  return attachments
}

// ─── Calculate cost (approximate) ────────────────────────────────────────────
function calculateCost(logoCount: number, bannerCount: number, extraDesigns: DesignTypeConfig[]): number {
  const logoCost = logoCount * 0.04
  const bannerCost = bannerCount * 0.07
  const extraCost = extraDesigns.reduce((sum, d) => {
    const perImage = d.imageSize === "1024x1024" ? 0.04 : 0.07
    return sum + d.count * perImage
  }, 0)
  return parseFloat((logoCost + bannerCost + extraCost).toFixed(4))
}

// ─── Main POST handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth()

    // 2. Parse body
    const {
      packageSlug,
      currency = "EUR",
      notes,
      logoPrompts = [] as string[],
      bannerPrompts = [] as string[],
      extraPrompts = {} as Record<string, string[]>,
      guestName,
      guestEmail,
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
    for (const design of staticPack.extraDesigns) {
      const prompts = extraPrompts[design.key] ?? []
      if (prompts.length !== design.count) {
        return NextResponse.json(
          { error: `Expected ${design.count} prompts for "${design.pluralLabel}", received ${prompts.length}` },
          { status: 400 },
        )
      }
    }
    if (bannerPrompts.length !== staticPack.bannerCount) {
      return NextResponse.json(
        { error: `Expected ${staticPack.bannerCount} banner prompts, received ${bannerPrompts.length}` },
        { status: 400 },
      )
    }

    // 5. Resolve user
    //    Case A: logged-in session → use session email
    //    Case B: no session → guestName + guestEmail required → find or create
    let user: { id: string; name: string | null; email: string }
    let newUserCredentials: { email: string; password: string } | undefined

    if (session?.user?.email) {
      // ── Case A: logged-in user ──────────────────────────────────────────
      const found = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (!found) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      user = found

    } else {
      // ── Case B: guest checkout ──────────────────────────────────────────
      if (!guestEmail?.trim() || !guestName?.trim()) {
        return NextResponse.json(
          { error: "Please provide your name and email to continue." },
          { status: 400 },
        )
      }

      const email = guestEmail.trim().toLowerCase()
      const existing = await prisma.user.findUnique({ where: { email } })

      if (existing) {
        // Account already exists — use it, do NOT expose credentials again
        user = existing
      } else {
        // New guest → auto-register with email as password
        const plainPassword = email                          // password = email
        const passwordHash = await bcrypt.hash(plainPassword, 12)

        const created = await prisma.user.create({
          data: {
            name: guestName.trim(),
            email,
            passwordHash,
          },
        })

        user = created
        newUserCredentials = { email, password: plainPassword }

        console.log(`[ORDER_GUEST_REGISTER] New account created for ${email}`)
      }
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
    const amount = convertPrice(staticPack.priceEur, selectedCurrency)
    const currencySymbol = getCurrencySymbol(selectedCurrency)

    // 9. Generate unique invoice number
    let invoiceNo = generateInvoiceNo()
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.subscription.findUnique({ where: { invoiceNo } })
      if (!exists) break
      invoiceNo = generateInvoiceNo()
    }

    // 10. Save subscription as PROCESSING
    const packageSnapshot = JSON.parse(JSON.stringify({
      slug: staticPack.slug,
      name: staticPack.name,
      tagline: staticPack.tagline,
      description: staticPack.description,
      features: staticPack.features,
      deliveryDays: staticPack.deliveryDays,
      priceEur: staticPack.priceEur,
      isPopular: staticPack.isPopular,
      theme: staticPack.theme,
      logoCount: staticPack.logoCount,
      bannerCount: staticPack.bannerCount,
      logoPrompts,
      bannerPrompts,
      extraDesigns: staticPack.extraDesigns,
      extraPrompts,
    }))

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        packageId: dbPackage.id,
        packageSnapshot,
        currency: selectedCurrency,
        amount,
        amountEur: staticPack.priceEur,
        invoiceNo,
        notes: notes || null,
        status: "PROCESSING",
      },
    })

    // 11. Return invoiceNo immediately — frontend starts polling
    const responsePayload = { invoiceNo: subscription.invoiceNo }

    // ── Background job (non-blocking) ──────────────────────────────────────
    ;(async () => {
      try {
        const generatedImages = await generateAllImages(
          apiKey,
          logoPrompts,
          bannerPrompts,
          extraPrompts,
          staticPack.name,
          staticPack.extraDesigns,
        )

        const costUsd = calculateCost(staticPack.logoCount, staticPack.bannerCount, staticPack.extraDesigns)
        await prisma.aIUsageLog.create({
          data: {
            userId: user.id,
            packageId: dbPackage.id,
            packageSlug: staticPack.slug,
            packageName: staticPack.name,
            tokensIn: 0,
            tokensOut: 0,
            costUsd,
          },
        })

        const emailData = {
          userName: user.name ?? "Customer",
          userEmail: user.email,
          invoiceNo: subscription.invoiceNo,
          packageName: staticPack.name,
          features: staticPack.features,
          deliveryDays: staticPack.deliveryDays,
          amount,
          currency: selectedCurrency,
          currencySymbol,
          subscriptionId: subscription.id,
          createdAt: subscription.createdAt,
          logoCount: staticPack.logoCount,
          bannerCount: staticPack.bannerCount,
          // Only set if a new account was created this order
          newUserCredentials,
        }

        const pdfBuffer = await generateInvoicePDF({
          ...emailData,
          tagline: staticPack.tagline,
        })

        const imageAttachments = await buildImageAttachments(generatedImages)

        console.log(
          `[ORDER_ATTACHMENTS] ${imageAttachments.length} files ready for ${subscription.invoiceNo}`,
          imageAttachments.map((a) => a.filename),
        )

        await Promise.all([
          sendOrderInvoiceEmail(emailData, pdfBuffer, imageAttachments),
          sendAdminNewOrderEmail(emailData, pdfBuffer, imageAttachments),
        ])

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "COMPLETED" },
        })

        console.log(
          `[ORDER_DONE] ${subscription.invoiceNo} — ${generatedImages.length} images (PNG+JPEG) sent to ${user.email}`,
        )

      } catch (bgErr: any) {
        console.error("[ORDER_BACKGROUND_ERROR]", bgErr?.message ?? bgErr)
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "CANCELLED",
            notes: `Generation failed: ${bgErr?.message ?? "Unknown error"}`,
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