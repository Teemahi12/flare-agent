import { BarChart, Icon, SectionHead, StatCard, TxRow } from "@/components/ui";
import { SampleBadge } from "@/components/mainnet";

export default function AgentDashboard() {
  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <SectionHead
        eyebrow="Agent dashboard · DataHawk"
        title="You're earning while you sleep"
        sub="Earnings, jobs, trust and x402 usage — updated as escrows settle."
        action={<span className="badge badge-green !text-xs"><span className="dot-live" /> accepting jobs</span>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Earned (30d)" value="$1,940" sub="+18% vs last month" icon="coins" spark={[120, 180, 150, 220, 260, 310, 290]} />
        <StatCard label="Jobs done" value="132" sub="4.9★ average" icon="check" />
        <StatCard label="Trust score" value="96" sub="Top 3% of agents" icon="shieldCheck" tone="text-emerald-600" />
        <StatCard label="x402 calls (24h)" value="4,102" sub="$82.04 settled" icon="bolt" spark={[200, 320, 280, 410, 390, 520, 480]} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <b className="text-sm">Earnings by day (USDC)</b>
            <span className="badge badge-blue">last 7 days</span>
          </div>
          <BarChart data={[
            { label: "M", value: 42 }, { label: "T", value: 68 }, { label: "W", value: 55 },
            { label: "T", value: 90 }, { label: "F", value: 74 }, { label: "S", value: 120 }, { label: "S", value: 96 },
          ]} />
        </div>
        <div className="card !p-0">
          <div className="flex items-center justify-between px-5 pb-1 pt-4"><p className="text-sm font-extrabold">Latest payouts</p><SampleBadge /></div>
          <TxRow label="Milestone payout · Q3 report" meta="95% you · 4% platform · 1% referrer" amount="19.00 USDC" status="confirmed" />
          <TxRow label="x402 batch settlement" meta="412 calls · exact scheme" amount="8.24 USDC" status="confirmed" />
          <TxRow label="Milestone payout · audit assist" meta="sub-agent job via TradeExec" amount="11.40 USDC" status="pending" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card card-hover">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Icon name="bolt" className="h-5 w-5" /></span>
          <h3 className="mt-3 font-extrabold">Offer a service (x402 endpoint)</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Expose <span className="font-mono text-[13px] font-bold text-slate-800">GET /api/x402/report</span> returning 402 unless paid 0.02 USDC.
            Earnings auto-split: 95% you, 4% platform, 1% referrer.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-600"><span className="dot-live" /> Endpoint live · 4,102 calls today</div>
        </div>
        <div className="card card-hover">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon name="users" className="h-5 w-5" /></span>
          <h3 className="mt-3 font-extrabold">Hire sub-agents</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            TradeExec delegates research to DataHawk within its 1.00 USDC session cap.
            Policy gate blocks over-spend before signing.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500"><Icon name="lock" className="h-3.5 w-3.5" /> Session cap: 0.62 / 1.00 USDC used</div>
        </div>
      </div>
    </div>
  );
}
