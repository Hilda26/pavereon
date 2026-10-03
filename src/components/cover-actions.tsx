"use client";

import { useState } from "react";
import { FileWarning, Power, RotateCw } from "lucide-react";
import type { Cover } from "@/lib/paveron";
import { NetworkGuard, useNetworkGuard } from "@/components/network-guard";
import { TxLifecycleList } from "@/components/tx-lifecycle";
import { useWalletAction } from "@/components/wallet-action";
import { isCoverId, isHttpsUrl } from "@/lib/validation/url";

export function CoverActions({ cover, onFinalized }: { cover: Cover; onFinalized: () => Promise<void> }) {
  const [incidentId, setIncidentId] = useState(`${String(cover.id)}-incident-1`);
  const [eventUrl, setEventUrl] = useState("https://example.com/event-report");
  const [summary, setSummary] = useState("The event evidence shows the covered rainfall disruption lasted at least 72 hours and directly matches the written payout trigger.");
  const { error, transactions, send } = useWalletAction(onFinalized);
  const { wrongNetwork } = useNetworkGuard();
  const status = String(cover.status);
  const canFile = status === "ACTIVE" && isCoverId(incidentId) && isHttpsUrl(eventUrl) && summary.trim().length >= 80;

  return (
    <section className="panel action-panel">
      <p className="eyebrow">Incident desk</p>
      <h2>Move this cover</h2>
      <NetworkGuard />
      {error && <p className="form-error">{error}</p>}
      {status === "ACTIVE" && (
        <form onSubmit={(event) => {
          event.preventDefault();
          if (!canFile) return;
          void send("File incident", "file_incident", [incidentId.trim(), String(cover.id), eventUrl.trim(), summary.trim()], 1n);
        }}>
          <label>Incident ID<input value={incidentId} onChange={(event) => setIncidentId(event.target.value)} /></label>
          <label>Event evidence URL<input type="url" value={eventUrl} onChange={(event) => setEventUrl(event.target.value)} /></label>
          <label>Loss summary<textarea value={summary} onChange={(event) => setSummary(event.target.value)} /></label>
          <button disabled={!canFile || wrongNetwork}><FileWarning size={16} /> File incident</button>
        </form>
      )}
      {status === "INCIDENT_OPEN" && (
        <button disabled={wrongNetwork} onClick={() => void send("Resolve incident", "resolve_incident", [String(cover.active_incident_id)])}><RotateCw size={16} /> Resolve incident</button>
      )}
      {status === "ACTIVE" && (
        <button className="quiet" disabled={wrongNetwork} onClick={() => void send("Retire cover", "retire_cover", [String(cover.id)])}><Power size={16} /> Retire cover</button>
      )}
      <TxLifecycleList transactions={transactions} />
    </section>
  );
}
