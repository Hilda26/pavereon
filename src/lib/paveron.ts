"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import type { CalldataEncodable, TransactionHash } from "genlayer-js/types";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAVERON_CONTRACT as `0x${string}` | undefined;
const endpoint = process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api";
const explorer = "https://explorer-studio.genlayer.com";

export type PoolSummary = Record<string, string>;
export type Cover = Record<string, string | boolean>;
export type Incident = Record<string, string | boolean>;
export type Ledger = { summary: PoolSummary; covers: Cover[]; incidents: Incident[] };

export const EMPTY_LEDGER: Ledger = {
  summary: {
    cover_count: "0",
    active_count: "0",
    paid_count: "0",
    incident_count: "0",
    min_premium: "1",
    reserve_balance: "0",
    reserved_exposure: "0",
    available_capacity: "0",
  },
  covers: [],
  incidents: [],
};

export const txUrl = (hash: string) => `${explorer}/tx/${hash}`;
export const addressUrl = (address: string) => `${explorer}/address/${address}`;

type EncodedArg =
  | string
  | number
  | boolean
  | null
  | EncodedArg[]
  | { __paveronBigInt: string }
  | { [key: string]: EncodedArg };

function client(account?: `0x${string}`) {
  return createClient({ chain: studionet, endpoint, account, provider: typeof window === "undefined" ? undefined : window.ethereum });
}

function configuredAddress(): `0x${string}` {
  if (!CONTRACT_ADDRESS || /^0x0{40}$/i.test(CONTRACT_ADDRESS)) throw new Error("Paveron contract not configured.");
  return CONTRACT_ADDRESS;
}

export async function readContract<T>(functionName: string, args: CalldataEncodable[] = []): Promise<T> {
  if (typeof window !== "undefined") {
    const response = await fetch("/api/paveron/read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ functionName, args: args.map(encodeArg) }),
    });
    const payload = await response.json() as { result?: T; error?: string };
    if (!response.ok || payload.error) {
      throw new Error(`Unable to read Paveron on StudioNet: ${payload.error ?? response.statusText}`);
    }
    return payload.result as T;
  }

  try {
    return await client().readContract({ address: configuredAddress(), functionName, args }) as T;
  } catch (error) {
    throw new Error(`Unable to read Paveron on StudioNet: ${error instanceof Error ? error.message : "RPC request failed."}`);
  }
}

function encodeArg(value: CalldataEncodable): EncodedArg {
  if (typeof value === "bigint") return { __paveronBigInt: value.toString() };
  if (Array.isArray(value)) return value.map((item) => encodeArg(item as CalldataEncodable));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encodeArg(item as CalldataEncodable)]));
  }
  return value as EncodedArg;
}

export async function loadLedger(): Promise<Ledger> {
  const [summary, covers, incidents] = await Promise.all([
    readContract<PoolSummary>("get_pool"),
    readContract<Cover[]>("list_covers", ["", 0n, 50n]),
    readContract<Incident[]>("list_incidents", ["", 0n, 50n]),
  ]);
  return { summary, covers, incidents };
}

export async function writeContract(account: `0x${string}`, functionName: string, args: CalldataEncodable[], value = 0n) {
  const writer = client(account);
  await writer.connect("studionet");
  return await writer.writeContract({ address: configuredAddress(), functionName, args, value, consensusMaxRotations: 3 }) as TransactionHash;
}

export async function waitFinalized(account: `0x${string}`, hash: TransactionHash) {
  const writer = client(account);
  await writer.connect("studionet");
  await writer.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 5000, retries: 180 });
  const transaction = await writer.getTransaction({ hash });
  const execution = transaction?.consensus_data?.leader_receipt?.[0]?.execution_result;
  if (execution && execution !== "SUCCESS") throw new Error(`Finalized transaction rolled back (${execution}).`);
  return { transaction, triggered: (transaction as unknown as { triggered_transactions?: string[] } | undefined)?.triggered_transactions ?? [] };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
