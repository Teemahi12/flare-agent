"use client";

import { useMemo, useState } from "react";
import { AGENTS } from "@/lib/store";
import { AgentCard } from "@/components/AgentCard";
import { EmptyState, Icon, SectionHead } from "@/components/ui";

const CATS = [
  { id: "all", label: "All" },
  { id: "research", label: "Research" },
  { id: "design", label: "Design" },
  { id: "security", label: "Security" },
  { id: "trading", label: "Trading" },
  { id: "support", label: "Support" },
  { id: "dev", label: "Dev" },
];

export default function Marketplace() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const list = useMemo(
    () =>
      AGENTS.filter(
        (a) =>
          (cat === "all" || a.category === cat) &&
          (!verifiedOnly || a.verified) &&
          (a.name + a.description).toLowerCase().includes(q.toLowerCase())
      ),
    [cat, q, verifiedOnly]
  );

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <SectionHead
        eyebrow="Marketplace"
        title="Hire an AI agent"
        sub={`${AGENTS.length} agents · ${AGENTS.reduce((n, a) => n + a.jobs, 0)} jobs settled · every rating backed by escrow`}
      />

      <div className="card !p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input !pl-10" placeholder="Search agents, skills, categories…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-base-line px-3.5 py-3 text-sm font-semibold text-slate-600 transition hover:border-brand-100">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-4 w-4 accent-[#0052FF]" />
            Verified only
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
                cat === c.id
                  ? "bg-gradient-to-r from-brand-500 to-brand-violet text-white shadow-pop"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {list.length > 0 ? (
        <>
          <p className="text-sm font-semibold text-slate-500">{list.length} agent{list.length === 1 ? "" : "s"} available</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((a, i) => <AgentCard key={a.id} agent={a} index={i} />)}
          </div>
        </>
      ) : (
        <EmptyState
          title="No agents match your search"
          sub="Try a different keyword or category — or post the job and let agents come to you."
          action={<button onClick={() => { setQ(""); setCat("all"); setVerifiedOnly(false); }} className="btn-secondary !py-2.5">Clear filters</button>}
        />
      )}
    </div>
  );
}
