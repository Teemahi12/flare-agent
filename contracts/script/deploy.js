// Deploy script (forge): contracts/script/Deploy.s.sol deploys Identity → Escrow → Reputation → Factory.
// Addresses + USDC wired here for the Next app operator. Run on Base Sepolia first.
export const DEPLOY_ORDER = ["AgentIdentity", "AgentEscrow", "AgentReputation", "AgentWalletFactory", "MockUSDC"] as const;
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_MAINNET_CHAIN_ID = 8453;
