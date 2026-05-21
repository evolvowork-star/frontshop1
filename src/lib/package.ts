// src/lib/packages.ts

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
}

export const PACKAGES: PackageData[] = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "pack",
    description: "Perfect for individuals just getting started.",
    priceEur: 99,
    features: [
      "1 project licence",
      "Basic email support",
      "5 GB cloud storage",
      "Standard delivery (7 days)",
    ],
    isPopular: false,
    theme: "light",
    deliveryDays: 7,
  },
  {
    slug: "basic",
    name: "Basic",
    tagline: "pack",
    description: "Great for freelancers who need a bit more room.",
    priceEur: 149,
    features: [
      "3 project licences",
      "Priority email support",
      "20 GB cloud storage",
      "1 revision round",
      "Delivery in 7 days",
    ],
    isPopular: false,
    theme: "light",
    deliveryDays: 7,
  },
  {
    slug: "standard",
    name: "Standard",
    tagline: "pack",
    description: "The most popular choice — covers everything you need.",
    priceEur: 249,
    features: [
      "10 project licences",
      "24 / 7 chat support",
      "100 GB cloud storage",
      "2 revision rounds",
      "Analytics dashboard",
      "Delivery in 5 days",
    ],
    isPopular: true,
    theme: "yellow",
    deliveryDays: 5,
  },
  {
    slug: "pro",
    name: "Pro",
    tagline: "pack",
    description: "For professionals who demand full control.",
    priceEur: 299,
    features: [
      "25 project licences",
      "Dedicated support line",
      "500 GB cloud storage",
      "3 revision rounds",
      "Advanced analytics",
      "API access",
      "Delivery in 5 days",
    ],
    isPopular: false,
    theme: "dark",
    deliveryDays: 5,
  },
  {
    slug: "business",
    name: "Business",
    tagline: "pack",
    description: "Everything you need to scale your operation.",
    priceEur: 499,
    features: [
      "Unlimited projects",
      "Priority dedicated support",
      "2 TB cloud storage",
      "Unlimited revisions",
      "Enterprise analytics",
      "Full API + webhooks",
      "White-label options",
      "Delivery in 3 days",
    ],
    isPopular: false,
    theme: "dark",
    deliveryDays: 3,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    tagline: "pack",
    description: "The complete solution for large organisations.",
    priceEur: 699,
    features: [
      "Unlimited everything",
      "24 / 7 dedicated manager",
      "Unlimited storage",
      "SLA guarantee",
      "Custom analytics",
      "Full API + webhooks",
      "White-label + reseller rights",
      "Custom integrations",
      "Delivery in 2 days",
    ],
    isPopular: false,
    theme: "dark",
    deliveryDays: 2,
  },
]

export function getPackageBySlug(slug: string): PackageData | undefined {
  return PACKAGES.find((p) => p.slug === slug)
}