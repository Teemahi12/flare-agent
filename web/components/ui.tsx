"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";

/* ============================= icons ============================= */

const PATHS: Record<string, React.ReactNode> = {
  check: <path d="M4 12.5l5 5L20 6.5" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  arrowRight: <path d="M4 12h15m-6-7l7 7-7 7" />,
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
  shield: <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />,
  shieldCheck: <><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" /><path d="M9 12l2 2 4-4" /></>,
  star: <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />,
  wallet: <><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /><path d="M3 7l2.5-3h12L20 7" /><circle cx="16.5" cy="13.5" r="1.2" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  alert: <><path d="M12 3L2 21h20L12 3z" /><path d="M12 10v5" /><circle cx="12" cy="18" r="0.5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><circle cx="12" cy="8" r="0.5" /></>,
  coins: <><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
  spark: <path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l4 4m6 6l4 4m0-14l-4 4m-6 6l-4 4" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2c2.9.4 5 2.4 5 5.8" /></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" /></>,
  pen: <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z" />,
  refresh: <path d="M20 12a8 8 0 10-2.3 5.6M20 12V6m0 6h-6" />,
  logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" />,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></>,
  external: <path d="M14 4h6v6M20 4L10 14M18 13v7a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h7" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  play: <path d="M7 4l13 8-13 8V4z" />,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
};

export function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof PATHS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {PATHS[name]}
    </svg>
  );
}

/* ============================= avatar / badges ============================= */

const AVATAR_GRADIENTS = [
  "from-blue-500 to-violet-500",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-fuchsia-500",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

export function Avatar({ id, name, size = "md" }: { id: string; name?: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-14 w-14 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  const g = AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
  const initials = (name ?? id).replace(/^0x/, "").slice(0, 2).toUpperCase();
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-extrabold text-white shadow-card ${g} ${dims}`}>
      {initials}
    </span>
  );
}

export function Stars({ rating, className = "h-3.5 w-3.5" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-800">
      <svg viewBox="0 0 24 24" className={`${className} fill-amber-400 stroke-amber-400`} aria-hidden>
        {PATHS.star}
      </svg>
      {rating.toFixed(1)}
    </span>
  );
}

export function TrustBadge({ trust }: { trust: number }) {
  const tone = trust >= 93 ? "badge-green" : trust >= 88 ? "badge-blue" : "badge-amber";
  return (
    <span className={`badge ${tone}`}>
      <Icon name="shieldCheck" className="h-3 w-3" /> Trust {trust}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "badge-blue",
    funded: "badge-violet",
    in_progress: "badge-amber",
    submitted: "badge-blue",
    completed: "badge-green",
    disputed: "badge-red",
    cancelled: "badge-slate",
    refunded: "badge-slate",
  };
  return <span className={`badge ${map[status] ?? "badge-slate"}`}>{status.replace(/_/g, " ")}</span>;
}

/* ============================= cards / stats ============================= */

export function SectionHead({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
        <h1 className="h-section">{title}</h1>
        {sub && <p className="mt-2 text-[15px] text-slate-600">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, spark, tone = "text-slate-900" }: {
  label: string; value: string; sub?: string; icon?: keyof typeof PATHS; spark?: number[]; tone?: string;
}) {
  return (
    <div className="card card-hover animate-fade-up !p-5">
      <div className="flex items-center justify-between">
        <p className="stat-label">{label}</p>
        {icon && (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon name={icon} className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className={`stat-value mt-1.5 ${tone}`}>{value}</p>
      {sub && <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p>}
      {spark && <Sparkline data={spark} className="mt-3" />}
    </div>
  );
}

export function Sparkline({ data, className = "", width = 220, height = 44 }: { data: number[]; className?: string; width?: number; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - 4 - ((v - min) / range) * (height - 10)}`).join(" ");
  const id = React.useId().replace(/:/g, "");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full ${className}`} style={{ height }} aria-hidden>
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0052FF" />
          <stop offset="100%" stopColor="#7B3FF2" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={`url(#sg-${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarChart({ data, height = 120 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="group flex flex-1 flex-col items-center gap-1.5 self-stretch justify-end" title={`${d.label}: ${d.value}`}>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-brand-500/80 to-brand-violet/80 transition-all group-hover:from-brand-500 group-hover:to-brand-violet"
            style={{ height: `${Math.max(6, (d.value / max) * 100)}%` }}
          />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ProgressBar({ pct, tone = "from-brand-500 to-brand-violet" }: { pct: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${tone}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold transition ${
                done ? "bg-emerald-500 text-white" : active ? "bg-gradient-to-r from-brand-500 to-brand-violet text-white shadow-pop" : "bg-slate-100 text-slate-400"
              }`}>
                {done ? <Icon name="check" className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-[11px] font-bold leading-tight ${active ? "text-slate-900" : done ? "text-slate-600" : "text-slate-400"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`mb-6 h-0.5 flex-1 rounded ${i < current ? "bg-emerald-400" : "bg-slate-200"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ============================= misc ============================= */

export function EmptyState({ icon = "search", title, sub, action }: { icon?: keyof typeof PATHS; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="font-bold text-slate-800">{title}</p>
      {sub && <p className="max-w-sm text-sm text-slate-500">{sub}</p>}
      {action}
    </div>
  );
}

export function TxRow({ label, meta, amount, status, hash }: {
  label: string; meta: string; amount?: string; status: "confirmed" | "pending" | "failed"; hash?: string;
}) {
  const dot = status === "confirmed" ? "bg-emerald-500" : status === "pending" ? "bg-amber-400 animate-pulse" : "bg-red-500";
  return (
    <div className="table-row">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800">{label}</p>
          <p className="truncate text-xs text-slate-500">{meta}{hash ? ` · ${hash}` : ""}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {amount && <span className="addr text-slate-800">{amount}</span>}
        <span className={`badge ${status === "confirmed" ? "badge-green" : status === "pending" ? "badge-amber" : "badge-red"}`}>{status}</span>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full animate-scale-in rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl ${wide ? "sm:max-w-lg" : "sm:max-w-md"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>
          <button onClick={onClose} className="btn-ghost !px-2" aria-label="Close"><Icon name="x" className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================= toasts ============================= */

type ToastKind = "success" | "error" | "info" | "pending";
interface Toast { id: number; kind: ToastKind; title: string; sub?: string }
const ToastCtx = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
    if (t.kind !== "pending") setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex animate-scale-in items-start gap-3 rounded-2xl border border-base-line bg-white p-4 shadow-pop">
            <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              t.kind === "success" ? "bg-emerald-50 text-emerald-600" : t.kind === "error" ? "bg-red-50 text-red-600" : t.kind === "pending" ? "bg-amber-50 text-amber-600" : "bg-brand-50 text-brand-600"
            }`}>
              {t.kind === "pending"
                ? <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-25" /><path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                : <Icon name={t.kind === "success" ? "check" : t.kind === "error" ? "x" : "info"} className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">{t.title}</p>
              {t.sub && <p className="mt-0.5 truncate text-xs text-slate-500">{t.sub}</p>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-brand-600">
      <svg viewBox="0 0 24 24" className="h-4 w-4 rotate-180" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15m-6-7l7 7-7 7" /></svg>
      {label}
    </Link>
  );
}
