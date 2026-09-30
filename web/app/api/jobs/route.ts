import { NextRequest, NextResponse } from "next/server";

// POST /api/jobs — create job + authorize escrow (operator pattern).
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.title || !body.budget || body.budget <= 0)
    return NextResponse.json({ error: "title + positive budget required" }, { status: 400 });
  const job = {
    id: "j_" + Math.random().toString(36).slice(2, 8),
    title: body.title,
    requirements: body.requirements ?? "",
    budget: body.budget,
    agentId: body.agentId ?? null,
    status: "funded",
    currency: "USDC",
    createdAt: new Date().toISOString(),
  };
  // In prod: build PaymentInfo (operator, payer, receiver, max, expiries, salt),
  // collect ERC-3009/SpendPermission signature, submit authorize() to
  // AuthCaptureEscrow, then insert jobs + settlements rows idempotently.
  const escrow = { status: "PaymentAuthorized", capturable: body.budget, paymentHash: "0x" + "a7".repeat(32) };
  return NextResponse.json({ job, escrow });
}

export async function GET() {
  return NextResponse.json({ jobs: [], note: "list backed by jobs table in prod" });
}
