"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseUnits } from "viem";
import { AGENTS, JOBS } from "@/lib/store";
import { Avatar, Icon, SectionHead, StatusPill, TxRow, useToast } from "@/components/ui";
import { IntegrationNotice, NetworkGuard, SampleBadge, TxTracker } from "@/components/mainnet";
import { useWallet } from "@/components/wallet/wallet";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { useEscrowTx } from "@/lib/contracts";
import { contractsConfigured, usdcFor } from "@/lib/mainnet";

function JobsInner() {
  const params = useSearchParams();
  const toast = useToast();
  const wallet = useWallet();
  const escrowTx = useEscrowTx();
  const preselected = AGENTS.find((a) => a.id === params.get("agent"))?.id ?? AGENTS[0].id;

  const [title, setTitle] = useState("");
  const [req, setReq] = useState("");
  const [budget, setBudget] = useState("25");
  const [agentId, setAgentId] = useState(preselected);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<{ jobId: string; escrow: string; budget: string } | null>(null);

  const agent = AGENTS.find((a) => a.id === agentId)!;
  const fee = (Number(budget) || 0) * 0.04;
  const valid = title.trim().length > 2 && Number(budget) > 0;
  const connected = wallet.status === "connected";

  const saveDraft = async () => {
    if (!valid || busy) return;
    if (!connected) {
      toast({ kind: "error", title: "Connect your wallet first", sub: "The draft records your funder address." });
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, requirements: req, budget: Number(budget), agentId, funder: wallet.address }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Job creation failed");
      setDraft({ jobId: j.job.id, escrow: j.escrow.status, budget });
      toast({ kind: "success", title: `Draft ${j.job.id} saved`, sub: "Offchain record — fund escrow to go live" });
    } catch (e) {
      toast({ kind: "error", title: "Could not save draft", sub: e instanceof Error ? e.message : "Try again." });
    } finally {
      setBusy(false);
    }
  };

  const fundEscrow = async () => {
    if (!draft || !wallet.address) return;
    const usdc = usdcFor(wallet.chainId);
    if (!usdc || !wallet.isSupportedChain) {
      toast({ kind: "error", title: "Unsupported network", sub: "Switch to Base or Base Sepolia first." });
      return;
    }
    // NOTE: agent.wallet is a directory placeholder until the onchain agent
    // registry (AgentIdentity) is deployed; then it resolves from tokenId.
    await escrowTx.execute("Fund escrow", {
      functionName: "create",
      args: [
        agent.wallet as `0x${string}`,
        usdc,
        parseUnits(budget, 6),
        [title || "Job"],
        [parseUnits(budget, 6)],
        BigInt(Math.floor(Date.now() / 1000) + 14 * 86400),
        BigInt(7),
        BigInt(400),
      ],
    });
  };

  return (
    <div className="grid animate-fade-up gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col gap-5">
        <SectionHead eyebrow="New job" title="Post a job" sub="Save an offchain draft, then fund escrow onchain. Funds release per milestone." />
        <NetworkGuard
          needsSwitch={wallet.needsNetworkSwitch}
          networkName={wallet.networkName}
          onSwitch={wallet.switchToDefault}
          canSwitch={wallet.canSwitchChain}
        />
        <div className="card flex flex-col gap-4">
          <div>
            <label className="label">Job title</label>
            <input className="input" placeholder="e.g. Q3 onchain growth report" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Requirements for the agent</label>
            <textarea className="input" rows={4} placeholder="Deliverables, data sources, deadline…" value={req} onChange={(e) => setReq(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Budget (USDC)</label>
              <input className="input input-amount" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div>
              <label className="label">Agent</label>
              <select className="input" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
                {AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name} — ${a.price}/task</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-base-bg p-3.5">
            <Avatar id={agent.id} name={agent.name} size="sm" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-bold">{agent.name} <span className="font-semibold text-slate-500">★ {agent.rating} · {agent.jobs} jobs</span></p>
              <p className="truncate text-xs text-slate-500">{agent.description}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-base-line text-sm">
            <div className="flex justify-between px-4 py-2.5"><span className="text-slate-500">Agent payout</span><b className="font-mono">${((Number(budget) || 0) - fee).toFixed(2)}</b></div>
            <div className="flex justify-between border-t border-base-line px-4 py-2.5"><span className="text-slate-500">Platform fee (4%)</span><b className="font-mono">${fee.toFixed(2)}</b></div>
            <div className="flex justify-between border-t border-base-line bg-base-bg px-4 py-2.5 rounded-b-2xl"><span className="font-bold">Total locked in escrow</span><b className="font-mono">${(Number(budget) || 0).toFixed(2)} USDC</b></div>
          </div>

          {!connected ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-brand-50 p-5 text-center">
              <p className="text-sm font-semibold text-slate-800">Connect a real wallet to continue</p>
              <ConnectButton compact />
              <p className="hint">Injected + Coinbase Wallet work now · QR pairing needs a WalletConnect project ID.</p>
            </div>
          ) : !draft ? (
            <button className="btn-primary w-full !py-3.5" disabled={!valid || busy} onClick={saveDraft}>
              {busy ? "Saving draft…" : <><Icon name="pen" className="h-4 w-4" />Save job draft</>}
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="animate-scale-in rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                <p className="flex items-center gap-2 font-bold text-emerald-800"><Icon name="check" className="h-4 w-4" />Draft {draft.jobId} saved (offchain)</p>
                <p className="mt-1 font-mono text-xs text-emerald-700">budget {draft.budget} USDC · funder {wallet.shortAddr}</p>
              </div>
              <IntegrationNotice action="Escrow funding" />
              {contractsConfigured && (
                <button
                  className="btn-primary w-full !py-3.5"
                  disabled={escrowTx.status === "awaiting-signature" || escrowTx.status === "confirming"}
                  onClick={fundEscrow}
                >
                  <Icon name="lock" className="h-4 w-4" />Fund escrow onchain — {budget} USDC
                </button>
              )}
              <TxTracker status={escrowTx.status} hash={escrowTx.hash} error={escrowTx.error} chainId={wallet.chainId} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h2 className="h-section !text-xl">Open jobs</h2>
        {JOBS.map((j) => (
          <div key={j.id} className="card card-hover !p-5">
            <div className="flex items-start justify-between gap-3">
              <b className="tracking-tight">{j.title}</b>
              <StatusPill status={j.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{j.requirements}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-lg font-extrabold">${j.budget} <span className="text-xs font-bold text-slate-400">USDC</span></span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Icon name="clock" className="h-3.5 w-3.5" />{j.createdAt}</span>
            </div>
          </div>
        ))}
        <div className="card !p-0">
          <div className="flex items-center justify-between px-5 pb-1 pt-4">
            <p className="text-sm font-extrabold">How escrow settles</p>
            <SampleBadge />
          </div>
          <TxRow label="Milestone released on capture()" meta="95% agent · 4% platform · 1% referrer" amount="60.00 USDC" status="confirmed" />
          <TxRow label="Escrow authorized at funding" meta="operator pattern · ERC-3009 signature" amount="120.00 USDC" status="confirmed" />
          <TxRow label="Dispute window after delivery" meta="arbiter resolves via resolveDispute" status="pending" />
          <p className="px-5 py-3 text-[11px] leading-relaxed text-slate-400">Illustrative flow — live settlement history appears here once contracts are deployed and the indexer is running.</p>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="card shimmer h-96" />}>
      <JobsInner />
    </Suspense>
  );
}
