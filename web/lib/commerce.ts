// Commerce math + escrow state machine mirror (ports 1:1 to AuthCaptureEscrow).
// Pure functions — unit tested in contracts/test/*.js.

export type EscrowStatus = "open" | "funded" | "in_progress" | "submitted" | "completed" | "disputed" | "cancelled" | "refunded";

const TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
  open: ["funded", "cancelled"],
  funded: ["in_progress", "disputed", "cancelled", "refunded"],
  in_progress: ["submitted", "disputed", "completed", "refunded"],
  submitted: ["completed", "disputed", "refunded"],
  disputed: ["completed", "refunded"],
  completed: [],
  cancelled: [],
  refunded: [],
};

export function canTransition(from: EscrowStatus, to: EscrowStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

// Basis-point split with remainder-to-seller (== Commerce Split contract).
export function splitPayment(total: bigint, sellerBps: number, platformBps: number, referrerBps: number) {
  if (sellerBps + platformBps + referrerBps !== 10000) throw new Error("bps must total 10000");
  const seller = (total * BigInt(sellerBps)) / 10000n;
  const platform = (total * BigInt(platformBps)) / 10000n;
  const referrerFloor = (total * BigInt(referrerBps)) / 10000n;
  const remainder = total - seller - platform - referrerFloor;
  return { seller: seller + remainder, platform, referrer: referrerFloor, dust: 0n };
}

// Idempotency key for settlement events (chain+tx+logIndex).
export function settlementKey(chainId: number | bigint, txHash: string, logIndex: number | bigint): string {
  return `${chainId}:${txHash.toLowerCase()}:${logIndex}`;
}

// Trust score mirrors AgentReputation.trustScore.
export function trustScore(completedJobs: number, totalRating: number, ratingCount: number, adjust: number): number {
  let s = 50 + Math.min(completedJobs * 2, 25);
  if (ratingCount > 0) s += (totalRating * 20) / (ratingCount * 5);
  s += adjust;
  return Math.max(0, Math.min(100, Math.round(s)));
}
