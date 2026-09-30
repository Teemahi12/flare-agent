"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { Icon } from "@/components/ui";
import { contractsConfigured, chainName, DEFAULT_CHAIN_ID } from "@/lib/mainnet";

const NAV = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/jobs", label: "Jobs" },
  { href: "/escrow", label: "Escrow" },
  { href: "/reputation", label: "Reputation" },
  { href: "/analytics", label: "Analytics" },
];

export function Header() {
  const path = usePathname();
  const [mobile, setMobile] = useState(false);

  return (
    <>
      <div className="bg-slate-950 px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide text-slate-300">
        {contractsConfigured ? (
          <><span className="mr-2 inline-block rounded bg-emerald-400/20 px-1.5 py-px text-[10px] font-bold uppercase text-emerald-300">Live</span>
          Connected to {chainName(DEFAULT_CHAIN_ID)} escrow contracts — signatures move real USDC.</>
        ) : (
          <><span className="mr-2 inline-block rounded bg-amber-400/20 px-1.5 py-px text-[10px] font-bold uppercase text-amber-300">Integration mode</span>
          Wallet connection is live · onchain actions unlock after contracts deploy.</>
        )}
        <Link href="/wallet" className="ml-2 underline decoration-slate-500 underline-offset-2 hover:text-white">Mainnet checklist</Link>
      </div>
      <header className="sticky top-0 z-40 border-b border-base-line bg-white/85 backdrop-blur-xl">
        <div className="container-x flex items-center justify-between gap-3 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-violet text-lg font-black text-white shadow-pop">A</span>
            <span className="text-[17px] font-extrabold tracking-tight">
              AgentCommerce
              <span className="badge badge-blue ml-2 hidden align-middle sm:inline-flex">on Base</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => {
              const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                    active ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="btn-secondary hidden !px-4 !py-2 sm:inline-flex">Dashboard</Link>
            <ConnectButton compact />
            <button className="btn-ghost !px-2 lg:hidden" onClick={() => setMobile((m) => !m)} aria-label="Menu">
              <Icon name={mobile ? "x" : "menu"} className="h-5 w-5" />
            </button>
          </div>
        </div>
        {mobile && (
          <nav className="animate-scale-in border-t border-base-line bg-white px-4 py-3 lg:hidden">
            <div className="grid gap-1">
              {[{ href: "/", label: "Home" }, ...NAV, { href: "/dashboard", label: "Dashboard" }, { href: "/agent", label: "Agent dashboard" }, { href: "/wallet", label: "Wallet" }].map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobile(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${path === n.href ? "bg-brand-50 text-brand-600" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

export function Footer() {
  const cols: [string, [string, string][]][] = [
    ["Marketplace", [["Browse agents", "/marketplace"], ["Post a job", "/jobs"], ["Reputation", "/reputation"], ["Analytics", "/analytics"]]],
    ["Product", [["Escrow workflow", "/escrow"], ["Client dashboard", "/dashboard"], ["Agent dashboard", "/agent"], ["Wallet", "/wallet"]]],
    ["Resources", [["Base docs", "https://docs.base.org"], ["BaseScan Sepolia", "https://sepolia.basescan.org"], ["Coinbase Wallet", "https://www.coinbase.com/wallet"], ["Circle USDC", "https://www.circle.com/usdc"]]],
  ];
  return (
    <footer className="mt-20 bg-slate-950 text-slate-400">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-violet text-lg font-black text-white">A</span>
            <span className="text-[17px] font-extrabold tracking-tight text-white">AgentCommerce</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            The marketplace where AI agents and humans transact autonomously on Base. USDC settlement, x402 micropayments, escrow protection.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
            <span className="dot-live" />
            <span>{chainName(DEFAULT_CHAIN_ID)} · USDC settlement · 200ms Flashblocks</span>
          </div>
        </div>
        {cols.map(([h, links]) => (
          <div key={h}>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">{h}</p>
            <ul className="flex flex-col gap-2.5 text-sm font-medium">
              {links.map(([label, href]) => (
                <li key={label}>
                  {href.startsWith("http") ? (
                    <a href={href} target="_blank" rel="noreferrer" className="transition hover:text-white">{label}</a>
                  ) : (
                    <Link href={href} className="transition hover:text-white">{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-xs">
          <span>© 2026 AgentCommerce · USDC on Base · audit before mainnet use.</span>
          <span className="flex gap-4"><span>USDC settlement</span><span>x402 micropayments</span><span>Escrow protection</span></span>
        </div>
      </div>
    </footer>
  );
}
