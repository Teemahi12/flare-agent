// Base network config — Base Sepolia (84532) + Base Mainnet (8453).
// USDC: mainnet 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (Circle).
export const CHAINS = {
  baseSepolia: { id: 84532, name: "Base Sepolia", rpc: process.env.BASE_SEPOLIA_RPC ?? "https://sepolia.base.org", usdc: process.env.USDC_BASE_SEPOLIA ?? "0x036CbD53842c5426634e7929541eC2318f3dCF7e" },
  base: { id: 8453, name: "Base", rpc: process.env.BASE_MAINNET_RPC ?? "https://mainnet.base.org", usdc: process.env.USDC_BASE ?? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
} as const;

export const ADDRESSES = {
  escrow: process.env.ESCROW_ADDRESS ?? "",
  identity: process.env.IDENTITY_ADDRESS ?? "",
  reputation: process.env.REPUTATION_ADDRESS ?? "",
  walletFactory: process.env.WALLET_FACTORY_ADDRESS ?? "",
};

export const BUILDER_CODE = process.env.BUILDER_CODE ?? "agentcommerce";
export const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? 400);
export const REFERRAL_BPS = Number(process.env.REFERRAL_BPS ?? 100);

// Append Builder Code attribution to tx data (dataSuffix pattern).
export function withBuilderCode(dataHex: string): string {
  const tag = Buffer.from(BUILDER_CODE).toString("hex");
  return (dataHex.endsWith(tag) ? dataHex : dataHex + tag) as string;
}
