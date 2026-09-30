"use client";

import { Icon } from "@/components/ui";
import { contractsConfigured, explorerTx, MISSING_CONFIG_HINT } from "@/lib/mainnet";
import type { TxStatus } from "@/lib/contracts";

/** Shown wherever an onchain action is unavailable before deployment. */
export function IntegrationNotice({ action }: { action: string }) {
  if (contractsConfigured) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
      <p className="flex items-center gap-2 font-bold text-amber-900">
        <Icon name="alert" className="h-4 w-4 shrink-0" /> {action} needs deployed contracts
      </p>
      <p className="mt-1 leading-relaxed text-amber-800">
        This UI is mainnet-ready but the escrow contracts are not deployed in this environment,
        so no transaction can be submitted. Deploy first:
      </p>
      <code className="mt-2 block overflow-x-auto rounded-xl bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
        forge script contracts/script/Deploy.s.sol --rpc-url $BASE_RPC --broadcast
      </code>
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-amber-700">then set: {MISSING_CONFIG_HINT}</p>
    </div>
  );
}

/** Pending → confirming → confirmed/failed tracker for a real wallet tx. */
export function TxTracker({ status, hash, error, chainId }: {
  status: TxStatus; hash?: `0x${string}`; error?: string | null; chainId?: number;
}) {
  if (status === "idle") return null;
  const link = hash ? explorerTx(chainId, hash) : null;
  return (
    <div className={`animate-scale-in rounded-2xl border p-4 text-sm ${
      status === "error" ? "border-red-200 bg-red-50" : status === "confirmed" ? "border-emerald-200 bg-emerald-50" : "border-brand-100 bg-brand-50/60"
    }`}>
      <p className="flex items-center gap-2 font-bold text-slate-900">
        {status === "awaiting-signature" && <><Spinner /> Waiting for wallet signature…</>}
        {status === "confirming" && <><Spinner /> Confirming onchain…</>}
        {status === "confirmed" && <><Icon name="check" className="h-4 w-4 text-emerald-600" /> Transaction confirmed</>}
        {status === "error" && <><Icon name="x" className="h-4 w-4 text-red-600" /> Transaction failed</>}
      </p>
      {hash && (
        <p className="mt-1 break-all font-mono text-[11px] text-slate-600">
          {hash} {link && <a href={link} target="_blank" rel="noreferrer" className="font-bold text-brand-600 hover:underline">View on explorer →</a>}
        </p>
      )}
      {error && <p className="mt-1 text-[13px] text-red-700">{error}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Marks panels whose numbers are illustrative until the settlement feed is live. */
export function SampleBadge() {
  return <span className="badge badge-slate" title="Illustrative numbers — live data connects after contracts deploy">Sample</span>;
}

/** Wrong-network callout with one-click switch. */
export function NetworkGuard({ needsSwitch, networkName, onSwitch, canSwitch }: {
  needsSwitch: boolean; networkName: string; onSwitch: () => void; canSwitch: boolean;
}) {
  if (!needsSwitch) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
      <p className="font-semibold text-red-800">You are on {networkName} — this app settles on Base networks.</p>
      <button onClick={onSwitch} disabled={!canSwitch} className="btn-primary !py-2 text-sm">Switch network</button>
    </div>
  );
}
