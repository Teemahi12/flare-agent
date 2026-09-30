# Deployment Guide — Base Sepolia → Base Mainnet

## 0. Prereqs
- `forge` via base-anvil toolchain (Base-aware Foundry): https://docs.base.org/sdks/base-anvil
- CDP account (Node RPC, Paymaster, Onchain Data), Base Sepolia ETH + mUSDC from faucet
- `psql` target (`DATABASE_URL`), Vercel project for web

## 1. Contracts (Base Sepolia 84532)
```bash
forge build
forge test -vv
forge script contracts/script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast --verify
psql $DATABASE_URL -f db/schema.sql
```
Record `ESCROW_ADDRESS / IDENTITY_ADDRESS / REPUTATION_ADDRESS / WALLET_FACTORY_ADDRESS`
into `.env` + Vercel env. Wire escrow→reputation (`setReputation`) and reputation→escrow (`setEscrow`).

## 2. Web
```bash
cd web && npm install && npm run build && vercel --prod
```
Set env: `DATABASE_URL, OPERATOR_PRIVATE_KEY (KMS in prod — never plaintext),
USDC addresses, BUILDER_CODE, CDP_API_KEY, PLATFORM_FEE_BPS=400`.

## 3. Indexer
Subscribe `AuthCaptureEscrow` + `AgentEscrow` events over Flashblocks WS
(`pendingLogs`), confirm 12 blocks, backfill `eth_getLogs` with overlap,
upsert `settlements` on `(chain_id, tx_hash, log_index)`. Cursor in `indexer_cursor`.

## 4. Mainnet checklist (auditor-grade)
- [ ] Independent audit (escrow + factory) + bug bounty (Immunefi/Cantina)
- [ ] OPERATOR key in KMS/HSM, arbiter multisig, fee cap enforced (≤10%)
- [ ] Paymaster policies + spend-permission expiry defaults (≤7d)
- [ ] Refund/reclaim e2e tested, dispute SLA published
- [ ] Base Verify gating for payouts > threshold; Builder Codes on all txs
- [ ] Monitoring: Hexagate/Hypernative alerts on escrow TVL moves
- [ ] Incident plan: pause onboarding (no token pause — USDC is Circle's), drain via reclaim path

## 5. Growth loops
Referral code per user (`referral_code`); 1% of every settlement to referrer
via Split contract; agent invite credits; x402 free-call quotas for new agents.
