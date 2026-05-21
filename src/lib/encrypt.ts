// src/lib/encrypt.ts
// API key ko safely encrypt/decrypt karne ke liye
// .env mein add karo: ENCRYPTION_KEY=any-32-char-random-string

import crypto from "crypto"

const ALGO   = "aes-256-cbc"
const KEY_LEN = 32

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY ?? ""
  if (!raw) throw new Error("ENCRYPTION_KEY is not set in .env")
  // Key ko exactly 32 bytes mein normalize karo
  return Buffer.from(raw.padEnd(KEY_LEN, "0").slice(0, KEY_LEN))
}

/**
 * Plaintext string ko encrypt karo
 * Returns: "iv:encryptedHex"
 */
export function encrypt(text: string): string {
  const iv  = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv)
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  return `${iv.toString("hex")}:${enc.toString("hex")}`
}

/**
 * "iv:encryptedHex" ko decrypt karo
 */
export function decrypt(payload: string): string {
  const [ivHex, encHex] = payload.split(":")
  const iv      = Buffer.from(ivHex, "hex")
  const enc     = Buffer.from(encHex, "hex")
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8")
}

/**
 * API key ko mask karo display ke liye
 * "sk-proj-abcdefghij..." → "sk-proj-...ghij"
 */
export function maskApiKey(key: string): string {
  if (key.length < 12) return "***"
  return `${key.slice(0, 8)}...${key.slice(-4)}`
}