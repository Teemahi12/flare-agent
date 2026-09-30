"use client";

import { useState } from "react";
import { useConnect, type Connector } from "wagmi";
import { Icon, Modal } from "@/components/ui";
import { useWallet } from "@/components/wallet/wallet";
import { walletConnectConfigured, chainName, DEFAULT_CHAIN_ID } from "@/lib/mainnet";

const BRAND_LETTER: Record<string, string> = {
  injected: "B",
  coinbase: "C",
  walletconnect: "W",
  metaMask: "M",
};

function optionMeta(id: string): { title: string; sub: string } {
  const lower = id.toLowerCase();
  if (lower.includes("coinbase")) return { title: "Coinbase Wallet", sub: "Smart Wallet · passkey login · gasless" };
  if (lower.includes("walletconnect")) return { title: "WalletConnect", sub: "QR pairing with 300+ wallets" };
  if (lower.includes("metamask")) return { title: "MetaMask", sub: "Injected browser extension" };
  return { title: "Browser wallet", sub: "Injected provider (Rabby, Brave, …)" };
}

export function ConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { connectors: rawConnectors, connect, isPending, variables } = useConnect();
  const connectors = rawConnectors as Connector[];

  const pick = (connector: Connector) => {
    connect(
      { connector },
      { onSuccess: () => onClose(), onError: () => { /* surfaced via connector UI + button state */ } }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Connect wallet">
      <p className="mb-4 text-sm text-slate-500">
        Connect a real wallet on <b>Base</b>. No funds move until you sign a transaction — every signature request shows the exact amount first.
      </p>
      <div className="flex flex-col gap-2">
        {connectors.map((c) => {
          const meta = optionMeta(c.id);
          const busy = isPending && (variables?.connector as Connector | undefined)?.id === c.id;
          return (
            <button
              key={c.uid}
              disabled={isPending}
              onClick={() => pick(c)}
              className="flex items-center gap-3 rounded-2xl border border-base-line p-3.5 text-left transition hover:border-brand-500 hover:bg-brand-50/50 hover:shadow-card disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-violet text-base font-extrabold text-white">
                {busy ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-25" /><path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                ) : (BRAND_LETTER[c.id] ?? BRAND_LETTER[Object.keys(BRAND_LETTER).find((k) => c.id.toLowerCase().includes(k)) ?? "injected"] ?? "W")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-900">{meta.title}</span>
                <span className="block truncate text-xs text-slate-500">{busy ? "Waiting for wallet…" : meta.sub}</span>
              </span>
              <Icon name="arrowRight" className="h-4 w-4 shrink-0 text-slate-300" />
            </button>
          );
        })}
      </div>
      {!walletConnectConfigured && (
        <p className="mt-3 rounded-xl bg-slate-100 p-3 text-xs leading-relaxed text-slate-500">
          QR pairing is unavailable until <span className="font-mono font-bold">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</span> is set
          (get one at cloud.walletconnect.com). Injected and Coinbase Wallet work without it.
        </p>
      )}
      <p className="hint mt-3 text-center">Target network: {chainName(DEFAULT_CHAIN_ID)} · Never share your seed phrase.</p>
    </Modal>
  );
}

export function ConnectButton({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const w = useWallet();

  if (w.status === "connected") {
    return (
      <div className="relative">
        <button
          onClick={() => setMenu((m) => !m)}
          className={`flex items-center gap-2.5 rounded-xl border bg-white py-2 pl-2 pr-3 shadow-card transition hover:shadow-pop ${
            w.needsNetworkSwitch ? "border-red-300" : "border-base-line hover:border-brand-100"
          }`}
        >
          <span className={w.needsNetworkSwitch ? "inline-flex h-2.5 w-2.5 rounded-full bg-red-500" : "dot-live ml-1.5"} />
          <span className="hidden text-left leading-tight sm:block">
            <span className="addr block text-slate-900">{w.shortAddr}</span>
            <span className="block text-[11px] font-semibold text-slate-500">
              {w.needsNetworkSwitch ? <span className="font-bold text-red-600">Wrong network — switch</span> : w.networkName}
              {w.usdcBalance ? ` · ${w.usdcBalance} USDC` : ""}
            </span>
          </span>
          <span className="addr sm:hidden">{w.shortAddr}</span>
        </button>
        {menu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
            <div className="absolute right-0 z-50 mt-2 w-72 animate-scale-in rounded-2xl border border-base-line bg-white p-2 shadow-pop">
              <div className="rounded-xl bg-base-bg px-3 py-2.5">
                <p className="text-xs font-semibold text-slate-500">{w.connectorName ?? "Wallet"}</p>
                <p className="addr text-slate-900">{w.shortAddr}</p>
                {w.explorerUrl && (
                  <a href={w.explorerUrl} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:underline">
                    View on explorer <Icon name="external" className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600">
                <span>Network</span>
                {w.needsNetworkSwitch
                  ? <span className="badge badge-red">{w.networkName}</span>
                  : <span className="badge badge-green">{w.networkName}</span>}
              </div>
              {w.usdcBalance !== null && (
                <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600">
                  <span>USDC balance</span><span className="addr">{w.usdcBalance}</span>
                </div>
              )}
              {w.needsNetworkSwitch && (
                <button
                  onClick={() => { w.switchToDefault(); setMenu(false); }}
                  disabled={!w.canSwitchChain}
                  className="btn-primary mt-1 w-full !py-2.5 text-sm"
                >
                  Switch to {chainName(DEFAULT_CHAIN_ID)}
                </button>
              )}
              {w.switchError && <p className="px-3 py-1 text-[11px] font-semibold text-red-600">{w.switchError}</p>}
              <button onClick={() => { setMenu(false); w.disconnect(); }} className="btn-ghost mt-1 w-full !justify-start text-red-600 hover:!bg-red-50">
                <Icon name="logout" className="h-4 w-4" /> Disconnect
              </button>
            </div>
          </>
        )}
        <ConnectModal open={open} onClose={() => setOpen(false)} />
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={`btn-primary ${compact ? "!px-4 !py-2" : ""}`} disabled={w.status === "connecting"}>
        {w.status === "connecting" ? (
          <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-25" /><path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>Connecting…</>
        ) : (
          <><Icon name="wallet" className="h-4 w-4" />{compact ? "Connect" : "Connect wallet"}</>
        )}
      </button>
      <ConnectModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
