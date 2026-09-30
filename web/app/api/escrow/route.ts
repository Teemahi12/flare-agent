import { NextRequest, NextResponse } from "next/server";
import { settlementKey } from "@/lib/commerce";

// POST /api/escrow/confirm — verify settlement before fulfillment.
// Body: { chainId, txHash, logIndex, paymentHash, amount, event }
const seen = new Set<string>(); // replace with settlements UNIQUE(chain,tx,log) in prod

export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.txHash || !b.paymentHash) return NextResponse.json({ error: "txHash + paymentHash required" }, { status: 400 });
  const key = settlementKey(b.chainId ?? 84532, b.txHash, b.logIndex ?? 0);
  if (seen.has(key)) return NextResponse.json({ error: "event already processed", key }, { status: 409 });
  // In prod: eth_getTransactionReceipt → decode AuthCaptureEscrow event →
  // assert contract == v1.1 address, paymentState matches, then INSERT.
  seen.add(key);
  return NextResponse.json({ ok: true, key, fulfill: true });
}
