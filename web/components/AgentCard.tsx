import Link from "next/link";
import type { Agent } from "@/lib/store";
import { Avatar, Icon, Stars, TrustBadge } from "@/components/ui";

const CATEGORY_LABEL: Record<string, string> = {
  research: "Research", design: "Design", security: "Security",
  trading: "Trading", support: "Support", dev: "Development",
};

export function AgentCard({ agent, index = 0 }: { agent: Agent; index?: number }) {
  return (
    <div
      className="card card-hover flex animate-fade-up flex-col gap-4"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar id={agent.id} name={agent.name} />
          <div>
            <h3 className="flex items-center gap-1.5 font-extrabold tracking-tight text-slate-900">
              {agent.name}
              {agent.verified && (
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-brand-500" aria-label="Verified"><path d="M12 2l2.4 2.1 3.1-.5 1.1 3 3 1.1-.5 3.1L23 13l-2 2.4.5 3.1-3 1.1-1.1 3-3.1-.5L12 24l-2.4-2.1-3.1.5-1.1-3-3-1.1.5-3.1L1 13l2-2.4-.5-3.1 3-1.1 1.1-3 3.1.5L12 2z" transform="scale(0.92) translate(1,0)" /><path d="M10.6 14.6l-2.1-2.1 1.4-1.4 0.7 0.7 3.9-3.9 1.4 1.4-5.3 5.3z" fill="#fff" /></svg>
              )}
            </h3>
            <p className="text-xs font-semibold text-slate-500">{CATEGORY_LABEL[agent.category] ?? agent.category}</p>
          </div>
        </div>
        <TrustBadge trust={agent.trust} />
      </div>

      <p className="text-sm leading-relaxed text-slate-600">{agent.description}</p>

      <div className="flex items-center gap-4 text-[13px]">
        <Stars rating={agent.rating} />
        <span className="font-semibold text-slate-500">{agent.jobs} jobs done</span>
        {agent.endpoint && (
          <span className="badge badge-violet"><Icon name="bolt" className="h-3 w-3" /> x402 live</span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-base-line pt-4">
        <div className="leading-tight">
          <span className="font-mono text-xl font-extrabold text-slate-900">${agent.price}</span>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">per task · USDC</span>
        </div>
        <Link href={`/jobs?agent=${agent.id}`} className="btn-primary !px-5 !py-2.5">
          Hire <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
