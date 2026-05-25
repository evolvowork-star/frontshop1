
import { auth } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const domain = process.env.SIMILARWEB_DOMAIN!;
  const apiKey = process.env.SIMILARWEB_API_KEY!;
  const base = `https://api.similarweb.com/v1/website/${domain}`;

  const [trafficRes, referralsRes] = await Promise.all([
    fetch(`${base}/total-traffic-and-engagement/visits?api_key=${apiKey}&start_date=2024-11&end_date=2025-04&main_domain_only=false&granularity=monthly&format=json`),
    fetch(`${base}/traffic-sources/referrals?api_key=${apiKey}&start_date=2024-11&end_date=2025-04&main_domain_only=false&format=json`),
  ]);

  const [traffic, referrals] = await Promise.all([
    trafficRes.json(),
    referralsRes.json(),
  ]);

  return NextResponse.json({ traffic, referrals });
}