import { NextResponse } from "next/server";
import { getMetricSummary } from "@/lib/metrics";

export const runtime = "nodejs";

export async function GET() {
  const summary = await getMetricSummary();
  return NextResponse.json(summary);
}
