// src/lib/getActiveAIKey.ts
import { prisma } from "@/src/lib/prisma"
import { decrypt } from "@/src/lib/encrypt"

export async function getActiveAPIKey() {
  const config = await prisma.aIConfig.findFirst({ where: { isActive: true } })
  if (!config) return null
  return { key: decrypt(config.apiKeyEnc), model: config.model, orgId: config.orgId }
}