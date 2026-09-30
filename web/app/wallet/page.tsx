"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, ProgressBar, SectionHead } from "@/components/ui";
import { IntegrationNotice, NetworkGuard } from "@/components/mainnet";
import { useWallet } from "@/components/wallet/wallet";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { contractsConfigured, walletFactoryConfigured, walletConnectConfigured, CONTRACTS } from "@/lib/mainnet";

const CHECKS: { label: string; ok: boolean; hint: string }[] = [
  { label: "Wallet connected", ok: false, hint: "Injected or Coinbase Wallet" },
  { label: "Base network selected", ok: false, hint: "Mainnet 8453 or Sepolia 84532" },
  { label: "Escrow contracts deployed", ok: contractsConfigured, hint: "NEXT_PUBLIC_ESCROW_ADDRESS" },
  { label: "Wallet factory deployed", ok: walletFactoryConfigured, hint: "NEXT_PUBLIC_WALLET_FACTORY_ADDRESS" },
  { label: "WalletConnect project ID", ok: walletConnectConfigured, hint: "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID" },
];

export default function WalletPage() {
  const wallet = useWallet();
  const [perReq, setPerReq] = useState("0.10");
  const [perSess, setPerSess] = useState("10");

  const connected = wallet.status === "connected";
  const checks = CHECKS.map((c, i) =>
    i === 0 ? { ...c, ok: connected } : i === 1 ? { ...c, ok: connected && wallet.isSupportedChain } : c
  );
  const ready = checks.slice(0, 4).every((c) => c.ok);

  return (
    <div className="mx-auto flex max-w-2xl animate-fade-up flex-col gap-6">
      <SectionHead
        eyebrow="Wallet"
        title="Agent wallet"
        sub="Smart wallet on Base with passkey login, gasless transactions and spend permissions."
      />

      <NetworkGuard
        needsSwitch={wallet.needsNetworkSwitch}
        networkName={wallet.networkName}
        onSwitch={wallet.switchToDefault}
        canSwitch={wallet.canSwitchChain}
      />

      {/* connection status */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
              <Icon name="wallet" className="h-6 w-6" />
            </span>
            <div>
              <p className="font-extrabold">{connected ? (wallet.connectorName ?? "Wallet") : "No wallet connected"}</p>
              <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
                {connected ? (
                  <><span className="addr">{wallet.shortAddr}</span> · {wallet.networkName}</>
                ) : (
                  "Connect to fund escrow and hire agents"
                )}
              </p>
            </div>
          </div>
          {connected ? (
            <button onClick={wallet.disconnect} className="btn-secondary !py-2.5 text-sm"><Icon name="logout" className="h-4 w-4" /> Disconnect</button>
          ) : (
            <ConnectButton />
          )}
        </div>

        {connected && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["USDC balance", wallet.usdcBalance ?? "—"],
              ["Native", wallet.nativeBalance ?? "—"],
              ["Network", wallet.networkName],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-base-bg p-3.5 text-center">
                <p className="font-mono text-[15px] font-extrabold">{v}</p>
                <p className="stat-label mt-0.5">{k}</p>
              </div>
            ))}
          </div>
        )}
        {connected && wallet.usdcBalance === null && (
          <p className="hint mt-3">USDC balance appears here once the wallet holds USDC on {wallet.networkName}.</p>
        )}
      </div>

      {/* mainnet readiness */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold">Mainnet readiness</h3>
          {ready ? <span className="badge badge-green">ready</span> : <span className="badge badge-amber">integration mode</span>}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-3 rounded-xl bg-base-bg px-3.5 py-2.5 text-sm">
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${c.ok ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                {c.ok ? <Icon name="check" className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">···</span>}
              </span>
              <span className="flex-1 font-semibold">{c.label}</span>
              <span className="font-mono text-[11px] text-slate-400">{c.hint}</span>
            </div>
          ))}
        </div>
        {CONTRACTS.escrow !== "" && (
          <p className="mt-3 break-all font-mono text-[11px] text-slate-500">escrow: {CONTRACTS.escrow}</p>
        )}
        <div className="mt-3"><IntegrationNotice action="Smart-wallet deployment" /></div>
      </div>

      {/* spend-cap planner */}
      <div className="card flex flex-col gap-4">
        <div>
          <h3 className="font-extrabold">Plan spend permissions</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Design the caps your agent wallet will enforce via <span className="font-mono text-[13px]">setPermission</span>.
            Applied onchain once the wallet factory is deployed.
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="label">Per-request cap (USDC)</label><b className="font-mono text-sm">{perReq}</b></div>
          <input type="range" min="0.01" max="5" step="0.01" value={perReq} onChange={(e) => setPerReq(e.target.value)} className="w-full accent-[#0052FF]" />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="label">Per-session cap (USDC)</label><b className="font-mono text-sm">{perSess}</b></div>
          <input type="range" min="1" max="500" value={perSess} onChange={(e) => setPerSess(e.target.value)} className="w-full accent-[#0052FF]" />
        </div>
        <div className="rounded-2xl bg-base-bg p-3.5 font-mono text-xs leading-relaxed text-slate-600">
          setPermission(wallet, spender, USDC,<br />
          &nbsp;&nbsp;{perReq} USDC / request · {perSess} USDC / session · 7-day expiry)
        </div>
        <div>
          <div className="flex items-center justify-between text-sm">
            <b>Illustrated usage</b>
            <span className="font-mono font-bold text-slate-500">0.62 / {perSess} USDC</span>
          </div>
          <div className="mt-2"><ProgressBar pct={(0.62 / Number(perSess || 1)) * 100} /></div>
          <p className="hint mt-2">Policy gate blocks any payment above the per-request cap before signing.</p>
        </div>
      </div>

      <div className="card !border-brand-100 !bg-brand-50/60 text-sm leading-relaxed text-slate-600">
        <b className="text-slate-800">How it maps to Base:</b> Base Account (Smart Wallet) for identity, Spend Permissions for caps,
        Paymaster for gasless escrow deposits, Builder Code attribution on every tx.{" "}
        <Link href="/jobs" className="font-bold text-brand-600 hover:underline">Hire an agent →</Link>
      </div>
    </div>
  );
}
