// Mainnet-first environment configuration (client-safe).
// Every value the UI needs to talk to Base mainnet comes from NEXT_PUBLIC_*
// vars. When credentials/addresses are absent the UI degrades to an explicit
// "integration mode" instead of simulating blockchain behavior.
// See .env.example for the full deployment checklist.

export const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID ?? 8453);

export const CHAINS = {
  8453: {
    id: 8453,
    name: "Base",
    rpc: process.env.NEXT_PUBLIC_BASE_MAINNET_RPC ?? "https://mainnet.base.org",
    usdc: (process.env.NEXT_PUBLIC_USDC_BASE ?? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") as `0x${string}`,
    explorer: "https://basescan.org",
  },
  84532: {
    id: 84532,
    name: "Base Sepolia",
    rpc: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC ?? "https://sepolia.base.org",
    usdc: (process.env.NEXT_PUBLIC_USDC_BASE_SEPOLIA ?? "0x036CbD53842c5426634e7929541eC2318f3dCF7e") as `0x${string}`,
    explorer: "https://sepolia.basescan.org",
  },
} as const;

export type SupportedChainId = keyof typeof CHAINS;
export const SUPPORTED_CHAIN_IDS = [8453, 84532] as const;

export function isSupportedChain(chainId: number | undefined): chainId is SupportedChainId {
  return chainId === 8453 || chainId === 84532;
}

export function chainName(chainId: number | undefined): string {
  if (isSupportedChain(chainId)) return CHAINS[chainId].name;
  return chainId ? `Chain ${chainId}` : "Unknown network";
}

export function usdcFor(chainId: number | undefined): `0x${string}` | null {
  return isSupportedChain(chainId) ? CHAINS[chainId].usdc : null;
}

// Deployed contract addresses. Empty until `forge script Deploy` has run and
// the addresses are exported here. The UI treats empty as "not deployed".
export const CONTRACTS = {
  escrow: (process.env.NEXT_PUBLIC_ESCROW_ADDRESS ?? "") as `0x${string}` | "",
  identity: (process.env.NEXT_PUBLIC_IDENTITY_ADDRESS ?? "") as `0x${string}` | "",
  reputation: (process.env.NEXT_PUBLIC_REPUTATION_ADDRESS ?? "") as `0x${string}` | "",
  walletFactory: (process.env.NEXT_PUBLIC_WALLET_FACTORY_ADDRESS ?? "") as `0x${string}` | "",
};

export const contractsConfigured = CONTRACTS.escrow !== "";
export const walletFactoryConfigured = CONTRACTS.walletFactory !== "";

export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
export const walletConnectConfigured = WALLETCONNECT_PROJECT_ID !== "";

export const PLATFORM_FEE_BPS = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS ?? 400);
export const REFERRAL_BPS = Number(process.env.NEXT_PUBLIC_REFERRAL_BPS ?? 100);
export const BUILDER_CODE = process.env.NEXT_PUBLIC_BUILDER_CODE ?? "agentcommerce";

export function explorerTx(chainId: number | undefined, hash: string): string | null {
  if (!isSupportedChain(chainId)) return null;
  return `${CHAINS[chainId].explorer}/tx/${hash}`;
}

export function explorerAddress(chainId: number | undefined, address: string): string | null {
  if (!isSupportedChain(chainId)) return null;
  return `${CHAINS[chainId].explorer}/address/${address}`;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Exact env vars the deployer must set before onchain actions go live. */
export const MISSING_CONFIG_HINT = [
  "NEXT_PUBLIC_ESCROW_ADDRESS",
  "NEXT_PUBLIC_WALLET_FACTORY_ADDRESS",
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (for QR pairing)",
].join(", ");
