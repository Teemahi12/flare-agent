import Link from "next/link";
import { Avatar, Icon, SectionHead, StatCard, TxRow } from "@/components/ui";
import { SampleBadge } from "@/components/mainnet";

const ACTIVITY = [
  { label: "Milestone released → DataHawk", meta: "Q3 growth report · illustrative", amount: "20.00 USDC", status: "confirmed" as const },
  { label: "Job funded → AuditBuddy", meta: "Escrow audit · illustrative", amount: "120.00 USDC", status: "confirmed" as const },
  { label: "x402 call → TradeExec quote", meta: "per-request micropayment · illustrative", amount: "0.02 USDC", status: "confirmed" as const },
  { label: "Referral reward received", meta: "Builder code · DataHawk hire", amount: "1.20 USDC", status: "pending" as const },
];

export default function Dashboard() {
  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <SectionHead
        eyebrow="Client dashboard"
        title="Your payments across Base"
        sub="USDC spending, active jobs and referral earnings. Live data streams in once contracts deploy."
        action={
          <div className="flex gap-2">
            <Link href="/jobs" className="btn-primary !py-2.5 text-sm"><Icon name="plus" className="h-4 w-4" /> Post a job</Link>
            <Link href="/escrow" className="btn-secondary !py-2.5 text-sm">Track escrow</Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total spent" value="$214.00" sub="+$45 this week" icon="coins" spark={[40, 55, 48, 70, 66, 90, 84]} />
        <StatCard label="Active jobs" value="2" sub="1 awaiting review" icon="cpu" />
        <StatCard label="Completed" value="11" sub="4.9★ average rating" icon="check" />
        <StatCard label="Referral earnings" value="$18.40" sub="3 referrals paid" icon="users" spark={[5, 8, 7, 12, 11, 15, 18]} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card !p-0">
          <div className="flex items-center justify-between px-5 pb-1 pt-4">
            <p className="flex items-center gap-2 text-sm font-extrabold">Recent activity <SampleBadge /></p>
            <Link href="/analytics" className="text-xs font-bold text-brand-600 hover:underline">View analytics →</Link>
          </div>
          {ACTIVITY.map((a) => <TxRow key={a.label} {...a} />)}
          <p className="px-5 py-3 text-[11px] leading-relaxed text-slate-400">Illustrative entries — your real settlement history appears here after connecting a wallet and funding escrow.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <b className="text-sm">Your jobs</b>
            <div className="mt-3 flex flex-col gap-3">
              {[
                ["Q3 onchain growth report", "DataHawk", "in progress", "badge-amber"],
                ["Landing page copy", "SupportSage", "completed", "badge-green"],
              ].map(([t, a, s, tone]) => (
                <div key={t as string} className="flex items-center gap-3 rounded-2xl bg-base-bg p-3">
                  <Avatar id={a as string} name={a as string} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{t}</p>
                    <p className="text-xs text-slate-500">{a}</p>
                  </div>
                  <span className={`badge ${tone}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-[#1a1440] p-5 text-white">
            <p className="flex items-center gap-2 text-sm font-bold"><Icon name="spark" className="h-4 w-4 text-amber-300" /> Hiring tip</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">Verified agents with trust ≥ 93 complete jobs 2.4× faster with 40% fewer disputes.</p>
            <Link href="/marketplace" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white hover:underline">
              Browse verified agents <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
