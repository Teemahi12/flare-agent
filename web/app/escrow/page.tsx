"use client";

import { useState } from "react";
import { Icon, Modal, ProgressBar, SectionHead, Stepper, TxRow, useToast } from "@/components/ui";
import { IntegrationNotice, NetworkGuard, SampleBadge, TxTracker } from "@/components/mainnet";
import { useWallet } from "@/components/wallet/wallet";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { useEscrowTx } from "@/lib/contracts";
import { contractsConfigured } from "@/lib/mainnet";

const STEPS = ["Funded", "In progress", "Submitted", "Completed"];
// Sample escrow #2 shown until the indexer serves live escrows by ?id=.
const ESCROW_ID = BigInt(2);
const MILESTONES = [
  { name: "Initial scan + findings", amount: 60 },
  { name: "Full report + gas review", amount: 60 },
];

export default function EscrowPage() {
  const toast = useToast();
  const wallet = useWallet();
  const tx = useEscrowTx();
  const [confirm, setConfirm] = useState<"release" | "refund" | "dispute" | null>(null);
  const [releasedIdx, setReleasedIdx] = useState<number | null>(null);

  const connected = wallet.status === "connected";
  const busy = tx.status === "awaiting-signature" || tx.status === "confirming";
  const total = MILESTONES.reduce((n, m) => n + m.amount, 0);

  const requireReady = () => {
    if (!connected) {
      toast({ kind: "error", title: "Connect your wallet first", sub: "Only the escrow parties can act." });
      return false;
    }
    if (wallet.needsNetworkSwitch) {
      toast({ kind: "error", title: "Wrong network", sub: "Switch to a Base network first." });
      return false;
    }
    if (!contractsConfigured) {
      toast({ kind: "error", title: "Contracts not deployed", sub: "No transaction was submitted." });
      return false;
    }
    return true;
  };

  const run = async (kind: "release" | "refund" | "dispute") => {
    if (!requireReady()) {
      setConfirm(null);
      return;
    }
    if (kind === "release") {
      const h = await tx.execute("Release milestone", { functionName: "releaseMilestone", args: [ESCROW_ID, BigInt(1)] });
      if (h) setReleasedIdx(1);
    } else if (kind === "refund") {
      await tx.execute("Refund client", { functionName: "cancelAndRefund", args: [ESCROW_ID] });
    } else {
      await tx.execute("Raise dispute", { functionName: "raiseDispute", args: [ESCROW_ID] });
    }
    setConfirm(null);
  };

  const confirmCopy = {
    release: { title: "Release milestone 2?", body: "60 USDC moves from escrow to AuditBuddy via releaseMilestone(2, 1). Review the exact amount in your wallet before signing.", cta: "Sign + release" },
    refund: { title: "Refund the client?", body: "Remaining escrow balance returns to the client via cancelAndRefund(2). This is an onchain transaction.", cta: "Sign + refund" },
    dispute: { title: "Raise a dispute?", body: "Funds freeze via raiseDispute(2) until the arbiter resolves. The loser loses trust points onchain.", cta: "Sign + dispute" },
  };

  return (
    <div className="mx-auto flex max-w-3xl animate-fade-up flex-col gap-6">
      <SectionHead
        eyebrow="Escrow · sample #2"
        title="Audit escrow — 120 USDC"
        sub="AuthCaptureEscrow semantics: authorize → capture / void · refund · reclaim after expiry."
        action={<SampleBadge />}
      />

      <NetworkGuard
        needsSwitch={wallet.needsNetworkSwitch}
        networkName={wallet.networkName}
        onSwitch={wallet.switchToDefault}
        canSwitch={wallet.canSwitchChain}
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Locked", "60 USDC", "lock"],
          ["Released", "60 USDC", "check"],
          ["Milestones", "1 / 2", "coins"],
        ].map(([k, v, icon]) => (
          <div key={k as string} className="card !p-4 text-center">
            <Icon name={icon as "lock"} className="mx-auto h-5 w-5 text-brand-500" />
            <p className="mt-1.5 font-mono text-lg font-extrabold">{v}</p>
            <p className="stat-label">{k}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <Stepper steps={STEPS} current={releasedIdx === 1 ? 3 : 2} />

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <b>Milestones</b>
            <span className="font-mono font-bold text-slate-600">{releasedIdx === 1 ? "120" : "60"}/{total} USDC released</span>
          </div>
          <ProgressBar pct={releasedIdx === 1 ? 100 : 50} />
          {MILESTONES.map((m, i) => {
            const done = i === 0 || releasedIdx === 1;
            return (
              <div key={m.name} className={`flex items-center gap-3 rounded-2xl border p-3.5 text-sm ${done ? "border-emerald-200 bg-emerald-50/60" : "border-base-line"}`}>
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                  {done ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                </span>
                <span className="flex-1 font-semibold">{m.name}</span>
                <span className="addr">{m.amount} USDC</span>
              </div>
            );
          })}
        </div>

        <IntegrationNotice action="Milestone release, refunds and disputes" />

        {!connected ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-brand-50 p-5 text-center">
            <p className="text-sm font-semibold text-slate-800">Connect the client or agent wallet to act on this escrow</p>
            <ConnectButton compact />
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary !py-2.5 text-sm" disabled={releasedIdx === 1 || busy} onClick={() => setConfirm("release")}>
              <Icon name="coins" className="h-4 w-4" /> Release milestone
            </button>
            <button className="btn-secondary !py-2.5 text-sm" disabled={busy} onClick={() => setConfirm("dispute")}>Raise dispute</button>
            <button className="btn-danger" disabled={busy} onClick={() => setConfirm("refund")}>Refund client</button>
          </div>
        )}

        <div className="mt-4">
          <TxTracker status={tx.status} hash={tx.hash} error={tx.error} chainId={wallet.chainId} />
        </div>
        {tx.status === "confirmed" && (
          <div className="mt-4 animate-scale-in rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <b>Confirmed onchain.</b> Balances, reputation and the settlement ledger update from the indexer.
          </div>
        )}
      </div>

      <div className="card !p-0">
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <p className="text-sm font-extrabold">Settlement history</p>
          <SampleBadge />
        </div>
        <TxRow label="Milestone 1 captured" meta="authorize → capture · 95/4/1 split" amount="60.00 USDC" status="confirmed" />
        <TxRow label="Escrow authorized" meta="operator pattern · ERC-3009 signature" amount="120.00 USDC" status="confirmed" />
        <TxRow label="Milestone 2 awaiting review" meta="agent submitted deliverable" status="pending" />
        <p className="px-5 py-3 text-[11px] leading-relaxed text-slate-400">Illustrative — live escrows load by ID from the indexer once contracts are deployed.</p>
      </div>

      <Modal open={confirm !== null} onClose={() => setConfirm(null)} title={confirm ? confirmCopy[confirm].title : ""}>
        <p className="text-sm leading-relaxed text-slate-600">{confirm && confirmCopy[confirm].body}</p>
        {!contractsConfigured && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
            Contracts are not deployed, so signing is disabled. See the setup notice above.
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button className="btn-secondary flex-1" onClick={() => setConfirm(null)}>Cancel</button>
          <button className="btn-primary flex-1" disabled={busy || !contractsConfigured} onClick={() => confirm && run(confirm)}>
            {busy ? "Waiting for wallet…" : confirm && confirmCopy[confirm].cta}
          </button>
        </div>
      </Modal>
    </div>
  );
}
