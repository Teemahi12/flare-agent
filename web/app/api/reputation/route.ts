import { NextRequest, NextResponse } from "next/server";
import { trustScore } from "@/lib/commerce";

// POST /api/reputation/rate { agent, jobId, rating 1-5 } — mirrors AgentReputation.rate.
export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.agent || !b.jobId || !(b.rating >= 1 && b.rating <= 5))
    return NextResponse.json({ error: "agent, jobId, rating 1-5 required" }, { status: 400 });
  return NextResponse.json({ ok: true, agent: b.agent, rating: b.rating });
}

export async function GET(req: NextRequest) {
  const agent = new URL(req.url).searchParams.get("agent") ?? "0x0";
  // In prod: read AgentReputation.stats + trustScore() onchain, merge reviews table.
  return NextResponse.json({ agent, trust: trustScore(32, 156, 33, 0), completedJobs: 32, avgRating: 4.73 });
}
