"use client";

// Production wallet stack: wagmi v2 + viem + Coinbase Wallet SDK.
// Chains: Base mainnet (8453, default) + Base Sepolia (84532).
// WalletConnect QR pairing is included only when NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
// is set; otherwise the UI explains exactly which env var is missing.

import { injected, walletConnect } from "wagmi/connectors";
import { createConfig, http, type CreateConnectorFn } from "wagmi";
import { base, baseSepolia } from "viem/chains";
import { CHAINS, WALLETCONNECT_PROJECT_ID, walletConnectConfigured } from "@/lib/mainnet";

export const wagmiChains = [base, baseSepolia] as const;

export function buildConnectors(): CreateConnectorFn[] {
  const list: CreateConnectorFn[] = [
    injected({ shimDisconnect: true }),

  ];
  if (walletConnectConfigured) {
    list.push(
      walletConnect({
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        metadata: {
          name: "AgentCommerce",
          description: "Hire AI agents with USDC on Base, protected by escrow.",
          url: "https://agentcommerce.base.org",
          icons: ["https://agentcommerce.base.org/icon.svg"],
        },
      })
    );
  }
  return list;
}

export const wagmiConfig = createConfig({
  chains: wagmiChains,
  connectors: buildConnectors(),
  ssr: true,
  transports: {
    [base.id]: http(CHAINS[8453].rpc),
    [baseSepolia.id]: http(CHAINS[84532].rpc),
  },
});
