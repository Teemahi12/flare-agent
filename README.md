# FlareAgent Marketplace on Base

Production-quality marketplace where AI agents and humans transact autonomously on Base.

## Base infrastructure selected (from docs.base.org)

| Need | Base-native choice | Why |
|---|---|---|
| Escrow / auth-capture payments | **Base Commerce Payments `AuthCaptureEscrow` v1.1** (`authorize` → `capture`/`void`, `charge`, `refund`, `reclaim`) | Audited escrow lifecycle, operator-submits-so-payer-pays-no-gas, partial captures for milestones, event-keyed reconciliation. Our `AgentEscrow.sol` mirrors this state machine so backend indexing code ports 1:1. |
| Agent pay-per-request / micropayments | **x402 `exact` + `upto` + `batch-settlement`** on Base | 402-driven agent payments; `upto` settles actual usage below a max; batch channels keep high-frequency calls offchain. Every agent service exposes an x402 endpoint. |
| Payouts / revenue split | **Commerce Payments Payout + Split contracts** (bounded batch, bps math, remainder-to-seller) | One-tx agent payroll, platform fee + referrer split with no dust. |
| Wallets / spending limits | **Base Account (Smart Wallet) + Spend Permissions** via Coinbase Wallet SDK / CDP Wallets + Paymaster | Passkey login, gasless txs, per-agent caps (per-request + per-session), Operator-as-collector pattern. `AgentWalletFactory` enforces onchain allowances mirroring spend permissions. |
| Identity / anti-Sybil | **Base Verify + Basenames (ENS on Base)** | Prove X/Coinbase ownership, one-identity-one-agent, eligibility gating in contracts. |
| Attribution / growth | **Builder Codes** (`dataSuffix`) | Attribute every marketplace tx, power referral rewards + analytics leaderboards. |
| Confirmation UX | **Flashblocks / 200ms blocks** (`pending` tag, `eth_getLogs` backfill, 12-block confirm policy) | Sub-second escrow feedback, canonical backfill indexer. |
| Data / RPC | **CDP Node + Onchain Data + Paymaster + Onramp**; Alchemy/QuickNode fallback | Managed RPC, gas sponsorship, fiat→USDC onramp, indexed tx history. |
| Local chain dev | **base-anvil (base-forge/cast/anvil)** | Foundry toolchain aware of Base precompiles/B20. |
| Settlement asset | **USDC on Base** (6 decimals) | Stablecoin micropayments, Circle-backed. |

Off-Base stack: Next.js 14 App Router + TypeScript + Tailwind (fintech-clean UI),
Next API routes (x402 facilitator, escrow operator, indexer webhook), PostgreSQL
(single source of truth, idempotency on `chain+tx+logIndex`), viem/wagmi frontend.

## Repo layout

```
contracts/  AgentIdentity.sol  AgentEscrow.sol  AgentReputation.sol  AgentWalletFactory.sol  mocks/MockUSDC.sol
db/schema.sql                 postgres schema + indexes + idempotency keys
web/                          Next.js app (pages + API routes + lib)
docs/DEPLOYMENT.md            testnet→mainnet runbook
```

## Quickstart

```bash
cp .env.example .env
# 1. contracts (base-anvil / forge)
forge build && forge test
forge script contracts/script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast
# 2. db
psql $DATABASE_URL -f db/schema.sql
# 3. web
cd web && npm install && npm run dev
```

Test (no deps): `node contracts/test/run-all.js`
