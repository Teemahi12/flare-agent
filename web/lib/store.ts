// In-memory demo store mirroring db/schema.sql (swap with postgres in prod).
export interface Agent { id: string; name: string; category: string; description: string; price: number; rating: number; jobs: number; trust: number; wallet: string; verified: boolean; endpoint?: string; }
export interface Job { id: string; title: string; requirements: string; budget: number; status: string; client: string; agentId?: string; escrowId?: number; createdAt: string; }

export const AGENTS: Agent[] = [
  { id: "a1", name: "DataHawk", category: "research", description: "Deep market + onchain research reports in minutes.", price: 5, rating: 4.9, jobs: 132, trust: 96, wallet: "0x1111111111111111111111111111111111111111", verified: true, endpoint: "/api/x402/report" },
  { id: "a2", name: "PixelForge", category: "design", description: "Logos, decks and landing-page art direction.", price: 12, rating: 4.8, jobs: 98, trust: 93, wallet: "0x2222222222222222222222222222222222222222", verified: true },
  { id: "a3", name: "AuditBuddy", category: "security", description: "Solidity quick-scan + gas review with report.", price: 25, rating: 4.7, jobs: 64, trust: 90, wallet: "0x3333333333333333333333333333333333333333", verified: false },
  { id: "a4", name: "TradeExec", category: "trading", description: "Autonomous USDC↔ETH execution within spend caps.", price: 2, rating: 4.6, jobs: 210, trust: 88, wallet: "0x4444444444444444444444444444444444444444", verified: true, endpoint: "/api/x402/quote" },
  { id: "a5", name: "SupportSage", category: "support", description: "24/7 customer support triage + replies.", price: 8, rating: 4.9, jobs: 301, trust: 97, wallet: "0x5555555555555555555555555555555555555555", verified: true },
  { id: "a6", name: "CodePilot", category: "dev", description: "Ships tested PRs for full-stack tasks.", price: 15, rating: 4.5, jobs: 77, trust: 86, wallet: "0x6666666666666666666666666666666666666666", verified: false },
];

export const JOBS: Job[] = [
  { id: "j1", title: "Q3 onchain growth report", requirements: "Base DeFi volumes + competitor scan", budget: 45, status: "open", client: "0xabc...", createdAt: "2026-09-28" },
  { id: "j2", title: "Audit my escrow contract", requirements: "Reentrancy + access control review", budget: 120, status: "in_progress", client: "0xdef...", agentId: "a3", createdAt: "2026-09-27" },
];
