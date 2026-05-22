// src/lib/package.ts

export type PackageTheme = "light" | "yellow" | "dark"

export interface PackageData {
  slug: string
  name: string
  tagline: string
  description: string
  priceEur: number
  features: string[]
  isPopular: boolean
  theme: PackageTheme
  deliveryDays: number
  logoCount: number    // ← new
  bannerCount: number
}

export const PACKAGES: PackageData[] = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "pack",
    description: "Perfect for quick personal projects.",
    priceEur: 99,
    features: [
      "1 Logo design",
      "1 Banner design",
      "AI-generated styles",
      "PNG + JPG files",
      "Basic color options",
      "Delivered instantly",
    ],
    isPopular: false,
    theme: "light",
    deliveryDays: 0,
    logoCount: 1,      // ← new
    bannerCount: 1,
  },
  {
    slug: "basic",
    name: "Basic",
    tagline: "pack",
    description: "More flexibility for small brands.",
    priceEur: 149,
    features: [
      "2 Logo designs",
      "2 Banner designs",
      "Transparent files included",
      "Social media ready sizes",
      "1 revision round",
      "Delivered instantly",
    ],
    isPopular: false,
    theme: "light",
    deliveryDays: 0,
    logoCount: 2,
    bannerCount: 2,
  },
  {
    slug: "standard",
    name: "Standard",
    tagline: "pack",
    description: "Most popular package for apps and websites.",
    priceEur: 249,
    features: [
      "4 Logo designs",
      "4 Banner designs",
      "HD quality exports",
      "Brand color matching",
      "2 revision rounds",
      "Priority generation",
      "Delivered instantly",
    ],
    isPopular: true,
    theme: "yellow",
    deliveryDays: 0,
    logoCount: 4,
    bannerCount: 4, 
  },
  {
    slug: "pro",
    name: "Pro",
    tagline: "pack",
    description: "Professional package with more creative options.",
    priceEur: 299,
    features: [
      "6 Logo designs",
      "6 Banner designs",
      "Premium AI styles",
      "Multiple file formats",
      "Source files included",
      "3 revision rounds",
      "Delivered instantly",
    ],
    isPopular: false,
    theme: "dark",
    deliveryDays: 0,
    logoCount: 6,
    bannerCount: 6,
  },
  {
    slug: "business",
    name: "Business",
    tagline: "pack",
    description: "Advanced package for growing businesses.",
    priceEur: 499,
    features: [
      "10 Logo designs",
      "10 Banner designs",
      "Full branding style set",
      "High-quality exports",
      "Priority support",
      "Delivered instantly",
    ],
    isPopular: false,
    theme: "dark",
    deliveryDays: 0,
    logoCount: 10,
    bannerCount: 10,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    tagline: "pack",
    description: "Complete package for large projects.",
    priceEur: 699,
    features: [
      "20 Logo designs",
      "20 Banner designs",
      "Custom AI-generated designs",
      "Full export package",
      "Dedicated support",
      "Delivered instantly",
    ],
    isPopular: false,
    theme: "dark",
    deliveryDays: 0,
    logoCount: 20,
    bannerCount: 20,
  },
]

export function getPackageBySlug(slug: string): PackageData | undefined {
  return PACKAGES.find((p) => p.slug === slug)
}