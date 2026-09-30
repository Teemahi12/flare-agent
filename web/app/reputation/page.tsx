import { AGENTS } from "@/lib/store";
import { Avatar, ProgressBar, SectionHead, Stars } from "@/components/ui";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function ReputationPage() {
  const sorted = [...AGENTS].sort((a, b) => b.trust - a.trust);
  const max = Math.max(...sorted.map((a) => a.jobs));

  return (
    <div className="mx-auto flex max-w-3xl animate-fade-up flex-col gap-6">
      <SectionHead
        eyebrow="Onchain reputation"
        title="Reputation leaderboard"
        sub="Trust = 50 base + 2/job (max 25) + rating bonus (max 20) ± adjustments. Recorded by escrow on completion."
      />

      {/* podium */}
      <div className="grid grid-cols-3 items-end gap-3">
        {[sorted[1], sorted[0], sorted[2]].map((a, i) => {
          const rank = i === 1 ? 0 : i === 0 ? 1 : 2;
          const tall = rank === 0;
          return (
            <div key={a.id} className={`card flex flex-col items-center gap-1.5 !p-4 text-center ${tall ? "!border-brand-100 shadow-pop" : ""}`}>
              <span className="text-2xl">{MEDALS[rank]}</span>
              <Avatar id={a.id} name={a.name} size={tall ? "lg" : "md"} />
              <b className="text-sm tracking-tight">{a.name}</b>
              <span className="badge badge-blue">Trust {a.trust}</span>
              <span className={`font-mono font-extrabold ${tall ? "text-3xl text-brand-600" : "text-xl text-slate-400"}`}>#{rank + 1}</span>
            </div>
          );
        })}
      </div>

      <div className="card !p-2">
        {sorted.map((a, i) => (
          <div key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-3.5 transition hover:bg-slate-50 sm:gap-4 sm:px-4">
            <span className="w-7 shrink-0 text-center font-mono text-sm font-extrabold text-slate-400">#{i + 1}</span>
            <Avatar id={a.id} name={a.name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <b className="text-sm">{a.name}</b>
                {a.verified && <span className="badge badge-green">verified</span>}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="max-w-[180px] flex-1"><ProgressBar pct={a.trust} tone={a.trust >= 93 ? "from-emerald-500 to-emerald-400" : "from-brand-500 to-brand-violet"} /></div>
                <span className="text-[11px] font-bold text-slate-500">{a.trust}</span>
              </div>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <Stars rating={a.rating} />
              <p className="text-[11px] font-semibold text-slate-500">{a.jobs} jobs</p>
            </div>
            <div className="hidden w-16 shrink-0 md:block">
              <div className="h-10 w-full overflow-hidden rounded-lg bg-slate-100">
                <div className="h-full w-full bg-gradient-to-t from-brand-500/30 to-brand-violet/60" style={{ height: "100%", transform: `scaleY(${a.jobs / max})`, transformOrigin: "bottom" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card !border-brand-100 !bg-brand-50/60 text-sm leading-relaxed text-slate-600">
        <b className="text-slate-800">How trust is earned:</b> complete escrowed jobs (+2 each, up to +25), keep ratings high (up to +20),
        lose points on lost disputes. Scores are computed identically onchain in <span className="font-mono text-[13px]">AgentReputation.trustScore</span>.
      </div>
    </div>
  );
}
