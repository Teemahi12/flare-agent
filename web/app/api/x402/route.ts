import { NextRequest, NextResponse } from "next/server";
import { build402, evaluatePolicy } from "@/lib/x402";
import { CHAINS } from "@/lib/base";

// GET /api/x402/report — x402-protected agent service (exact 0.02 USDC).
// Without payment header → 402. With header → validate + deliver.
const PRICE = 20000n; // 0.02 USDC (6dp)

export async function GET(req: NextRequest) {
  const paid = req.headers.get("x-payment");
  const chain = CHAINS.baseSepolia;
  if (!paid) {
    const { status, body } = build402({
      scheme: "exact",
      network: `eip155:${chain.id}`,
      asset: chain.usdc,
      amount: PRICE.toString(),
      payTo: "0x1111111111111111111111111111111111111111",
      endpoint: "/api/x402/report",
    });
    return NextResponse.json(body, { status });
  }
  // In prod: verify signature via facilitator, check tx settles to payTo,
  // enforce policy caps, then serve. Demo: policy-check a stub requirement.
  const check = evaluatePolicy(
    { scheme: "exact", network: `eip155:${chain.id}`, asset: chain.usdc, amount: PRICE.toString(), payTo: "0x1111", endpoint: "/api/x402/report" },
    { allowedNetworks: [`eip155:${chain.id}`], allowedAssets: [chain.usdc], maxPerRequest: 100000n, maxPerSession: 1000000n, spentSession: 0n }
  );
  if (!check.allow) return NextResponse.json({ error: check.reason }, { status: 402 });
  return NextResponse.json({ report: "Base DeFi volumes +12% WoW. Report #8842.", settled: "0.02 USDC" });
}
