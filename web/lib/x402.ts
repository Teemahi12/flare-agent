// x402 client policy + server requirement builder.
// Schemes: exact (fixed price), upto (max authorize, settle actual), batch-settlement.

export type X402Scheme = "exact" | "upto" | "batch-settlement";

export interface PaymentRequirements {
  scheme: X402Scheme;
  network: string; // e.g. "eip155:84532"
  asset: string; // USDC address
  amount: string; // atomic units
  maxAmount?: string; // upto
  payTo: string;
  endpoint: string;
}

export interface SpendPolicy {
  allowedNetworks: string[];
  allowedAssets: string[];
  maxPerRequest: bigint;
  maxPerSession: bigint;
  spentSession: bigint;
}

export function evaluatePolicy(req: PaymentRequirements, policy: SpendPolicy): { allow: boolean; reason?: string } {
  if (!policy.allowedNetworks.includes(req.network)) return { allow: false, reason: "network not allowed" };
  if (!policy.allowedAssets.map((a) => a.toLowerCase()).includes(req.asset.toLowerCase()))
    return { allow: false, reason: "asset not allowed" };
  const amount = BigInt(req.amount);
  if (amount > policy.maxPerRequest) return { allow: false, reason: `${amount} > maxPerRequest ${policy.maxPerRequest}` };
  if (policy.spentSession + amount > policy.maxPerSession) return { allow: false, reason: "session cap exceeded" };
  return { allow: true };
}

export function build402(requirements: PaymentRequirements): { status: 402; body: unknown } {
  return {
    status: 402,
    body: {
      x402Version: 1,
      accepts: [
        {
          scheme: requirements.scheme,
          network: requirements.network,
          maxAmountRequired: requirements.maxAmount ?? requirements.amount,
          resource: requirements.endpoint,
          payTo: requirements.payTo,
          asset: requirements.asset,
        },
      ],
    },
  };
}

// Demo facilitator: settle upto at actual usage below max.
export function settleUsage(maxAtomic: bigint, usedAtomic: bigint): bigint {
  if (usedAtomic > maxAtomic) throw new Error("usage exceeds authorized max");
  return usedAtomic;
}
