export type PackageTheme = "light" | "yellow" | "dark"

// ─── New: generic design type config ─────────────────────────────────────────
export interface DesignTypeConfig {
  key:               string              // "social", "thumbnail", "icon", etc.
  label:             string              // "Social Media Post"
  pluralLabel:       string              // "Social Media Posts"
  count:             number
  imageSize:         "1024x1024" | "1536x1024"
  promptPlaceholder: string
  systemContext:     string              // AI system prompt for this type
}

export interface PackageData {
  slug:         string
  name:         string
  tagline:      string
  description:  string
  priceEur:     number
  features:     string[]
  isPopular:    boolean
  theme:        PackageTheme
  deliveryDays: number
  logoCount:    number
  bannerCount:  number
  extraDesigns: DesignTypeConfig[]       // ← New (empty array = no extras)
}

export const PACKAGES: PackageData[] = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "pack",
    description: "Perfect for quick personal projects.",
    priceEur: 99,
    features: [
      "1 Logo design", "1 Banner design", "AI-generated styles",
      "PNG + JPG files", "Basic color options", "Delivered instantly",
    ],
    isPopular: false, theme: "light", deliveryDays: 0,
    logoCount: 1, bannerCount: 1,
    extraDesigns: [],                    // ← no extras, existing flow unchanged
  },
  {
    slug: "basic",
    name: "Basic",
    tagline: "pack",
    description: "More flexibility for small brands.",
    priceEur: 149,
    features: [
      "2 Logo designs", "2 Banner designs", "Transparent files included",
      "Social media ready sizes", "1 revision round", "Delivered instantly",
    ],
    isPopular: false, theme: "light", deliveryDays: 0,
    logoCount: 2, bannerCount: 2,
    extraDesigns: [],
  },
  {
    slug: "standard",
    name: "Standard",
    tagline: "pack",
    description: "Most popular package for apps and websites.",
    priceEur: 249,
    features: [
      "4 Logo designs", "4 Banner designs", "HD quality exports",
      "Brand color matching", "2 revision rounds", "Priority generation", "Delivered instantly",
    ],
    isPopular: true, theme: "yellow", deliveryDays: 0,
    logoCount: 4, bannerCount: 4,
    extraDesigns: [],
  },

  // ── Pro ─────────────────────────────────────────────────────────────────────
  {
    slug: "pro",
    name: "Pro",
    tagline: "pack",
    description: "Professional package with extra creative assets.",
    priceEur: 299,
    features: [
      "4 Logo designs", "4 Banner designs",
      "2 Social media post designs", "1 YouTube thumbnail design",
      "1 App icon design", "Source files included",
      "Premium AI styles", "Delivered instantly",
    ],
    isPopular: false, theme: "dark", deliveryDays: 0,
    logoCount: 4, bannerCount: 4,
    extraDesigns: [
      {
        key:               "social",
        label:             "Social Media Post",
        pluralLabel:       "Social Media Posts",
        count:             2,
        imageSize:         "1024x1024",
        promptPlaceholder: `Describe social post — e.g. "Instagram post for NovaByte, bold typography, dark background, product launch announcement"`,
        systemContext:     "You are a professional social media designer. Create a square (1:1) social media post that is eye-catching, on-brand, and optimized for Instagram/Facebook. Bold design, clear hierarchy.",
      },
      {
        key:               "thumbnail",
        label:             "YouTube Thumbnail",
        pluralLabel:       "YouTube Thumbnails",
        count:             1,
        imageSize:         "1536x1024",
        promptPlaceholder: `Describe thumbnail — e.g. "YouTube thumbnail for a tech tutorial, bold red title text, shocked face illustration, dark techy background"`,
        systemContext:     "You are a professional YouTube thumbnail designer. Create a high-contrast, click-worthy 16:9 thumbnail with bold text and strong visual hierarchy that performs well on YouTube.",
      },
      {
        key:               "icon",
        label:             "App Icon",
        pluralLabel:       "App Icons",
        count:             1,
        imageSize:         "1024x1024",
        promptPlaceholder: `Describe app icon — e.g. "iOS app icon for a fitness app, gradient blue-purple, lightning bolt symbol, rounded corners, clean and modern"`,
        systemContext:     "You are a professional app icon designer. Create a clean, recognizable square app icon suitable for iOS and Android. Simple symbol on a solid or gradient background, no text.",
      },
    ],
  },

  // ── Business ─────────────────────────────────────────────────────────────────
  {
    slug: "business",
    name: "Business",
    tagline: "pack",
    description: "Advanced branding package for online businesses.",
    priceEur: 499,
    features: [
      "4 Logo designs", "4 Banner designs",
      "3 Social media content designs", "1 Website hero banner",
      "1 Business card design", "High-quality exports", "Delivered instantly",
    ],
    isPopular: false, theme: "dark", deliveryDays: 0,
    logoCount: 4, bannerCount: 4,
    extraDesigns: [
      {
        key:               "social",
        label:             "Social Media Post",
        pluralLabel:       "Social Media Posts",
        count:             3,
        imageSize:         "1024x1024",
        promptPlaceholder: `Describe social post — e.g. "Instagram promo post for a clothing brand, minimal white layout, product photo space on right, brand name in serif font"`,
        systemContext:     "You are a professional social media designer. Create a square (1:1) social media post that is eye-catching, on-brand, and optimized for Instagram/Facebook.",
      },
      {
        key:               "hero",
        label:             "Website Hero Banner",
        pluralLabel:       "Website Hero Banners",
        count:             1,
        imageSize:         "1536x1024",
        promptPlaceholder: `Describe hero banner — e.g. "Full-width website hero for a SaaS company, dark navy background, floating UI mockup, headline 'Ship Faster' in white bold font"`,
        systemContext:     "You are a professional web designer. Create a wide-format website hero banner (16:9) that is visually stunning, professional, and suitable as a landing page header. Include space for a headline.",
      },
      {
        key:               "businesscard",
        label:             "Business Card",
        pluralLabel:       "Business Cards",
        count:             1,
        imageSize:         "1536x1024",
        promptPlaceholder: `Describe business card — e.g. "Horizontal business card for John Doe, CEO at NovaByte, dark matte black background, gold typography, minimal layout"`,
        systemContext:     "You are a professional print designer. Create a horizontal business card design (landscape orientation). Include space for name, title, company, and contact info. Clean, professional, print-ready.",
      },
    ],
  },

  // ── Enterprise ───────────────────────────────────────────────────────────────
  {
    slug: "enterprise",
    name: "Enterprise",
    tagline: "pack",
    description: "Premium creative package for serious brands.",
    priceEur: 699,
    features: [
      "4 Logo designs", "4 Banner designs",
      "4 Social media designs", "2 Website landing visuals",
      "2 Presentation graphics", "Premium export formats", "Delivered instantly",
    ],
    isPopular: false, theme: "dark", deliveryDays: 0,
    logoCount: 4, bannerCount: 4,
    extraDesigns: [
      {
        key:               "social",
        label:             "Social Media Design",
        pluralLabel:       "Social Media Designs",
        count:             4,
        imageSize:         "1024x1024",
        promptPlaceholder: `Describe social design — e.g. "LinkedIn post for enterprise software launch, corporate blue palette, data visualization graphic, professional tone"`,
        systemContext:     "You are a professional social media designer. Create a square (1:1) social media design that is premium, on-brand, and suitable for LinkedIn/Instagram. Corporate and polished aesthetic.",
      },
      {
        key:               "landing",
        label:             "Website Landing Visual",
        pluralLabel:       "Website Landing Visuals",
        count:             2,
        imageSize:         "1536x1024",
        promptPlaceholder: `Describe landing visual — e.g. "Hero section for a fintech landing page, abstract dark background with glowing blue lines, '10x Your Revenue' headline placement"`,
        systemContext:     "You are a premium web designer. Create a wide-format website landing page visual (16:9). Sophisticated, conversion-focused design with clear focal point for headline placement.",
      },
      {
        key:               "presentation",
        label:             "Presentation Graphic",
        pluralLabel:       "Presentation Graphics",
        count:             2,
        imageSize:         "1536x1024",
        promptPlaceholder: `Describe presentation graphic — e.g. "Title slide for investor pitch deck, dark slate background, company logo top left, bold white headline, subtle grid pattern"`,
        systemContext:     "You are a professional presentation designer. Create a wide-format (16:9) slide graphic suitable for PowerPoint or Keynote. Clean layout, professional typography, suitable for business presentations.",
      },
    ],
  },
]

export function getPackageBySlug(slug: string): PackageData | undefined {
  return PACKAGES.find((p) => p.slug === slug)
}