"use client";

// Wallet state backed by real wagmi connections — no simulated addresses,
// balances, or transactions. When no wallet/credentials exist in this
// environment the UI reports that honestly instead of faking it.

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useAccount, useBalance, useDisconnect, useReadContract, useSwitchChain } from "wagmi";
import { formatUnits } from "viem";
import {
  chainName, contractsConfigured, explorerAddress, isSupportedChain,
  shortAddress, usdcFor, walletConnectConfigured,
  DEFAULT_CHAIN_ID, SUPPORTED_CHAIN_IDS,
} from "@/lib/mainnet";
import { erc20Abi } from "@/lib/contracts";
import { useToast } from "@/components/ui";

export type WalletStatus = "disconnected" | "connecting" | "connected";

interface WalletCtx {
  status: WalletStatus;
  address: `0x${string}` | undefined;
  shortAddr: string | null;
  connectorName: string | null;
  chainId: number | undefined;
  networkName: string;
  isSupportedChain: boolean;
  needsNetworkSwitch: boolean;
  switchToDefault: () => void;
  canSwitchChain: boolean;
  switchError: string | null;
  nativeBalance: string | null;
  usdcBalance: string | null;
  usdcAddress: `0x${string}` | null;
  explorerUrl: string | null;
  disconnect: () => void;
  contractsConfigured: boolean;
  walletConnectConfigured: boolean;
  defaultChainId: number;
}

const Ctx = createContext<WalletCtx | null>(null);

export const useWallet = () => {
  const w = useContext(Ctx);
  if (!w) throw new Error("useWallet must be used inside <WalletProvider>");
  return w;
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const { address, chainId, connector, isConnected, isConnecting, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching, error: switchErr } = useSwitchChain();

  const usdc = usdcFor(chainId);
  const { data: usdcRaw } = useReadContract({
    address: usdc ?? undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!usdc && isSupportedChain(chainId), refetchInterval: 15000 },
  });
  const { data: native } = useBalance({ address, query: { enabled: !!address, refetchInterval: 15000 } });

  const doDisconnect = useCallback(() => {
    disconnect();
    toast({ kind: "info", title: "Wallet disconnected" });
  }, [disconnect, toast]);

  const switchToDefault = useCallback(() => {
    if (!SUPPORTED_CHAIN_IDS.includes(DEFAULT_CHAIN_ID as 8453)) return;
    switchChain(
      { chainId: DEFAULT_CHAIN_ID as 8453 },
      {
        onError: (e) => toast({ kind: "error", title: "Network switch failed", sub: e.message.split("\n")[0] }),
      }
    );
  }, [switchChain, toast]);

  const value = useMemo<WalletCtx>(() => {
    const supported = isSupportedChain(chainId);
    return {
      status: isConnected ? "connected" : isConnecting || isReconnecting ? "connecting" : "disconnected",
      address,
      shortAddr: address ? shortAddress(address) : null,
      connectorName: connector?.name ?? null,
      chainId,
      networkName: chainName(chainId),
      isSupportedChain: supported,
      needsNetworkSwitch: isConnected && !supported,
      switchToDefault,
      canSwitchChain: !isSwitching,
      switchError: switchErr ? switchErr.message.split("\n")[0] : null,
      nativeBalance: native ? `${Number(native.formatted).toFixed(4)} ${native.symbol}` : null,
      usdcBalance: usdcRaw !== undefined ? Number(formatUnits(usdcRaw as bigint, 6)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null,
      usdcAddress: usdc,
      explorerUrl: address ? explorerAddress(chainId, address) : null,
      disconnect: doDisconnect,
      contractsConfigured,
      walletConnectConfigured,
      defaultChainId: DEFAULT_CHAIN_ID,
    };
  }, [address, chainId, connector, doDisconnect, isConnected, isConnecting, isReconnecting, isSwitching, native, switchErr, switchToDefault, usdc, usdcRaw]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
