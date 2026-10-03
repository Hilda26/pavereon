"use client";

import { CheckCircle2, CircleAlert, CircleDashed, ExternalLink, LoaderCircle } from "lucide-react";
import { isFailureState, type TxRecord } from "@/lib/tx/useTransaction";
import { txUrl } from "@/lib/paveron";

export function TxLifecycleList({ transactions }: { transactions: TxRecord[] }) {
  if (transactions.length === 0) return null;
  return (
    <div className="tx-list">
      {transactions.map((tx) => {
        const failed = isFailureState(tx.state);
        const done = tx.state === "DONE";
        const Icon = failed ? CircleAlert : done ? CheckCircle2 : tx.state === "AWAITING_SIGNATURE" ? CircleDashed : LoaderCircle;
        return (
          <a key={tx.hash} className={`tx-row ${failed ? "failed" : done ? "done" : ""}`} href={tx.hash.startsWith("pending-") ? undefined : txUrl(tx.hash)} target="_blank" rel="noreferrer">
            <Icon className={done || failed ? "" : "spin"} size={16} />
            <span>{tx.label}</span>
            <strong>{tx.state.toLowerCase().replaceAll("_", " ")}</strong>
            {!tx.hash.startsWith("pending-") && <ExternalLink size={13} />}
          </a>
        );
      })}
    </div>
  );
}
