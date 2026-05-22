import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function auth(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  })
  return token
}