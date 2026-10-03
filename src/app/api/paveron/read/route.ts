import { NextResponse } from "next/server";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { CalldataEncodable } from "genlayer-js/types";

export const runtime = "nodejs";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAVERON_CONTRACT as `0x${string}` | undefined;
const endpoint = process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api";

type EncodedArg =
  | string
  | number
  | boolean
  | null
  | EncodedArg[]
  | { __paveronBigInt: string }
  | { [key: string]: EncodedArg };

function configuredAddress(): `0x${string}` {
  if (!CONTRACT_ADDRESS || /^0x0{40}$/i.test(CONTRACT_ADDRESS)) throw new Error("Paveron contract not configured.");
  return CONTRACT_ADDRESS;
}

function decodeArg(value: EncodedArg): CalldataEncodable {
  if (Array.isArray(value)) return value.map(decodeArg) as CalldataEncodable;
  if (value && typeof value === "object") {
    const maybeBigInt = (value as { __paveronBigInt?: unknown }).__paveronBigInt;
    if (typeof maybeBigInt === "string") return BigInt(maybeBigInt);
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decodeArg(item)])) as CalldataEncodable;
  }
  if (value === null) return "" as CalldataEncodable;
  return value as CalldataEncodable;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { functionName?: string; args?: EncodedArg[] };
    const functionName = String(body.functionName ?? "");
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(functionName)) {
      return NextResponse.json({ error: "Invalid function name." }, { status: 400 });
    }

    const args = (body.args ?? []).map(decodeArg);
    const client = createClient({ chain: studionet, endpoint });
    const result = await client.readContract({ address: configuredAddress(), functionName, args });
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to read Paveron." },
      { status: 500 }
    );
  }
}
