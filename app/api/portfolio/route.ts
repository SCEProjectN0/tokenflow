import { NextResponse } from "next/server";
import { getPortfolioData } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const data = await getPortfolioData();
  return NextResponse.json(data);
}
