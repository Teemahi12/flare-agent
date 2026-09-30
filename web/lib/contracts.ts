"use client";

// Onchain integration layer. ABIs mirror contracts/*.sol 1:1 so the frontend
// can submit real transactions the moment addresses are deployed and exported
// via NEXT_PUBLIC_* env vars. Until then every write is blocked with an
// explicit "contracts not deployed" error — never simulated.

import { useCallback, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACTS, contractsConfigured, isSupportedChain } from "@/lib/mainnet";
import { useToast } from "@/components/ui";

export const erc20Abi = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "allowance", type: "function", stateMutability: "view", inputs: [{ name: "o", type: "address" }, { name: "s", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "s", type: "address" }, { name: "a", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

/** Mirrors contracts/AgentEscrow.sol */
export const escrowAbi = [
  { name: "create", type: "function", stateMutability: "nonpayable", inputs: [{ name: "agent", type: "address" }, { name: "token", type: "address" }, { name: "total", type: "uint256" }, { name: "titles", type: "string[]" }, { name: "milestoneAmounts", type: "uint256[]" }, { name: "deadline", type: "uint256" }, { name: "authExpiryDays", type: "uint256" }, { name: "feeBps", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { name: "startWork", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { name: "submitWork", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { name: "releaseMilestone", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }, { name: "idx", type: "uint256" }], outputs: [] },
  { name: "raiseDispute", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { name: "resolveDispute", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }, { name: "clientShareBps", type: "uint256" }], outputs: [] },
  { name: "cancelAndRefund", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { name: "reclaimExpired", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
] as const;

/** Mirrors contracts/AgentWalletFactory.sol */
export const walletFactoryAbi = [
  { name: "createWallet", type: "function", stateMutability: "nonpayable", inputs: [{ name: "controller", type: "address" }], outputs: [{ name: "wallet", type: "address" }] },
  { name: "setPermission", type: "function", stateMutability: "nonpayable", inputs: [{ name: "wallet", type: "address" }, { name: "spender", type: "address" }, { name: "token", type: "address" }, { name: "perReq", type: "uint256" }, { name: "perSess", type: "uint256" }, { name: "expiresAt", type: "uint64" }], outputs: [] },
  { name: "revoke", type: "function", stateMutability: "nonpayable", inputs: [{ name: "wallet", type: "address" }, { name: "spender", type: "address" }], outputs: [] },
] as const;

export type TxStatus = "idle" | "awaiting-signature" | "confirming" | "confirmed" | "error";

export const NOT_DEPLOYED_ERROR =
  "Escrow contracts are not deployed yet. Run `forge script Deploy` and set NEXT_PUBLIC_ESCROW_ADDRESS — no transaction was submitted.";

/**
 * Real transaction state machine for escrow writes.
 * Surfaces pending (awaiting signature → confirming) / success (hash + receipt)
 * / failure states to the UI. Blocked cleanly when contracts are unconfigured.
 */
export function useEscrowTx() {
  const toast = useToast();
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
  const [status, setStatus] = useState<TxStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const receipt = useWaitForTransactionReceipt({ hash });

  const execute = useCallback(
    async (label: string, args: { functionName: string; args: unknown[] }) => {
      setError(null);
      if (!contractsConfigured || !CONTRACTS.escrow) {
        const msg = NOT_DEPLOYED_ERROR;
        setError(msg);
        setStatus("error");
        toast({ kind: "error", title: "Contracts not deployed", sub: "Set NEXT_PUBLIC_ESCROW_ADDRESS after deploying." });
        return null;
      }
      try {
        setStatus("awaiting-signature");
        toast({ kind: "pending", title: `${label} — confirm in wallet…` });
        const h = await writeContractAsync({
          address: CONTRACTS.escrow,
          abi: escrowAbi,
          functionName: args.functionName,
          args: args.args,
        } as unknown as Parameters<typeof writeContractAsync>[0]);
        setHash(h);
        setStatus("confirming");
        toast({ kind: "pending", title: `${label} — confirming…`, sub: h });
        return h;
      } catch (e) {
        const msg = e instanceof Error ? (e.message.split("\n")[0] ?? "Transaction rejected.") : "Transaction rejected.";
        setError(msg);
        setStatus("error");
        toast({ kind: "error", title: `${label} failed`, sub: msg.slice(0, 120) });
        return null;
      }
    },
    [toast, writeContractAsync]
  );

  const reset = useCallback(() => {
    setHash(undefined);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    execute, reset, hash, error,
    isConfirming: status === "confirming" || (receipt.isLoading && !!hash),
    isConfirmed: receipt.isSuccess,
    status: receipt.isSuccess ? ("confirmed" as TxStatus) : status,
  };
}

/** Guard helper for pages: is this wallet ready for mainnet writes? */
export function writeReadiness(chainId: number | undefined, isConnected: boolean): { ready: boolean; reason: string | null } {
  if (!isConnected) return { ready: false, reason: "Connect a wallet to continue." };
  if (!isSupportedChain(chainId)) return { ready: false, reason: "Unsupported network. Switch to Base or Base Sepolia." };
  if (!contractsConfigured) return { ready: false, reason: NOT_DEPLOYED_ERROR };
  return { ready: true, reason: null };
}
