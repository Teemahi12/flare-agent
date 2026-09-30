import { BarChart, Icon, SectionHead, StatCard } from "@/components/ui";
import { SampleBadge } from "@/components/mainnet";

const ROWS: [string, string, string, number[]][] = [
  ["Volume (30d)", "$182,400", "+12.4% WoW", [120, 140, 132, 160, 155, 178, 182]],
  ["Jobs settled", "2,412", "+8.1% WoW", [1800, 1950, 1900, 2100, 2200, 2300, 2412]],
  ["Median settle time", "3m 12s", "−22s vs last week", [240, 230, 225, 210, 205, 198, 192]],
  ["Dispute rate", "1.8%", "−0.3pp · healthy", [2.6, 2.4, 2.3, 2.1, 2.0, 1.9, 1.8]],
  ["Avg rating", "4.78 ★", "+0.05 this month", [4.6, 4.65, 4.7, 4.72, 4.75, 4.77, 4.78]],
  ["Referral rewards", "$6,200", "1,204 referrers paid", [3.1, 3.8, 4.0, 4.6, 5.2, 5.8, 6.2]],
];

export default function AnalyticsPage() {
  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <SectionHead
        eyebrow="Analytics"
        title="Marketplace analytics"
        sub="Illustrative metrics — the live settlement ledger (gross, fees, refunds keyed by payment hash) connects after contracts deploy."
        action={
          <span className="flex items-center gap-2">
            <SampleBadge />
            <a href="/api/analytics" target="_blank" rel="noreferrer" className="btn-secondary !py-2.5 text-sm">
              <Icon name="external" className="h-4 w-4" /> Export CSV
            </a>
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {ROWS.map(([k, v, sub, spark]) => (
          <StatCard key={k} label={k} value={v} sub={sub} spark={spark} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <b className="text-sm">Weekly settlement volume (k USDC)</b>
            <span className="badge badge-green">+12.4%</span>
          </div>
          <BarChart data={[
            { label: "W1", value: 32 }, { label: "W2", value: 41 }, { label: "W3", value: 38 },
            { label: "W4", value: 47 }, { label: "W5", value: 52 }, { label: "W6", value: 61 },
          ]} height={140} />
        </div>
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <b className="text-sm">Jobs by category</b>
            <span className="badge badge-blue">2,412 total</span>
          </div>
          {[
            ["Research", 32, "from-brand-500 to-brand-violet"],
            ["Support", 24, "from-emerald-500 to-teal-400"],
            ["Dev", 18, "from-amber-500 to-orange-400"],
            ["Design", 14, "from-rose-500 to-pink-400"],
            ["Trading", 12, "from-cyan-500 to-blue-400"],
          ].map(([k, pct, tone]) => (
            <div key={k as string} className="mb-3 last:mb-0">
              <div className="mb-1 flex justify-between text-[13px]"><span className="font-semibold">{k}</span><b className="font-mono">{pct}%</b></div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card text-sm text-slate-500">
        Source: <span className="font-mono text-[13px] font-bold text-slate-700">settlements</span> table joined to escrow events.
        Export raw JSON from <a href="/api/analytics" className="font-bold text-brand-600 hover:underline">/api/analytics</a>.
      </div>
    </div>
  );
}
