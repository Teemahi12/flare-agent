import { NextRequest, NextResponse } from "next/server";
import { splitPayment } from "@/lib/commerce";
import { PLATFORM_FEE_BPS, REFERRAL_BPS } from "@/lib/base";

// POST /api/referrals/settle { totalAtomic, referrer } — exact bps split, no dust.
export async function POST(req: NextRequest) {
  const b = await req.json();
  const total = BigInt(b.totalAtomic ?? "0");
  if (total <= 0n) return NextResponse.json({ error: "totalAtomic > 0 required" }, { status: 400 });
  const sellerBps = 10000 - PLATFORM_FEE_BPS - REFERRAL_BPS;
  const s = splitPayment(total, sellerBps, PLATFORM_FEE_BPS, REFERRAL_BPS);
  const str = (v: bigint) => v.toString();
  return NextResponse.json({ seller: str(s.seller), platform: str(s.platform), referrer: str(s.referrer), dust: "0" });
}
