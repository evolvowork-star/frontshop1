import { BetaAnalyticsDataClient } from "@google-analytics/data";

import { auth } from "@/src/lib/auth";
import { NextResponse } from "next/server";

const analyticsClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export async function GET() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const propertyId = process.env.GA4_PROPERTY_ID!;

  // Run multiple reports in parallel
  const [sessionsRes, topPagesRes, devicesRes] = await Promise.all([
    // Sessions + users for last 30 days
    analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "screenPageViews" },
      ],
    }),
    // Top 5 pages
    analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 5,
    }),
    // Device breakdown
    analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
    }),
  ]);

  const overview = sessionsRes[0].rows?.[0]?.metricValues;
  const topPages = topPagesRes[0].rows?.map((r) => ({
    path: r.dimensionValues?.[0]?.value,
    views: Number(r.metricValues?.[0]?.value ?? 0),
    users: Number(r.metricValues?.[1]?.value ?? 0),
  })) ?? [];

  const devices = devicesRes[0].rows?.map((r) => ({
    device: r.dimensionValues?.[0]?.value,
    sessions: Number(r.metricValues?.[0]?.value ?? 0),
  })) ?? [];

  return NextResponse.json({
    sessions: Number(overview?.[0]?.value ?? 0),
    users: Number(overview?.[1]?.value ?? 0),
    bounceRate: parseFloat(overview?.[2]?.value ?? "0").toFixed(1),
    avgDuration: Number(overview?.[3]?.value ?? 0),
    pageViews: Number(overview?.[4]?.value ?? 0),
    topPages,
    devices,
  });
}