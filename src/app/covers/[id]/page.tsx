"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, LoaderCircle } from "lucide-react";
import { CoverActions } from "@/components/cover-actions";
import { addressUrl, readContract, type Cover, type Incident } from "@/lib/paveron";
import { coverLabel, incidentLabel, statusTone } from "@/lib/contract/status";

export default function CoverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>();
  const [cover, setCover] = useState<Cover>();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => { void params.then((value) => setId(value.id)); }, [params]);

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      setError(undefined);
      const [nextCover, nextIncidents] = await Promise.all([
        readContract<Cover>("get_cover", [id]),
        readContract<Incident[]>("list_incidents", [id, 0n, 50n]),
      ]);
      setCover(nextCover);
      setIncidents(nextIncidents);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load cover.");
    }
  }, [id]);

  useEffect(() => { void refresh(); }, [refresh]);

  if (error) return <main className="pv-body"><p className="pv-alert">{error}</p><Link className="back-link" href="/">Back to pool</Link></main>;
  if (!cover) return <main className="pv-body"><p className="muted"><LoaderCircle className="spin" size={16} /> Reading cover...</p></main>;

  const status = String(cover.status);
  return (
    <main className="pv-body">
      <Link className="back-link" href="/">Back to pool</Link>
      <section className="cover-detail">
        <p className="eyebrow">{String(cover.risk_domain)} · {String(cover.region)}</p>
        <h1>{String(cover.title)}</h1>
        <p className="lede"><span className={`badge ${statusTone(status)}`}>{coverLabel(status)}</span> Cap {String(cover.payout_cap ?? "0")} GEN · premium {String(cover.premium ?? "0")} GEN</p>
        <div className="detail-grid">
          <article className="panel">
            <h2>Trigger capsule</h2>
            <p className="trigger-copy">{String(cover.trigger)}</p>
            <dl className="detail-list">
              <dt>Holder</dt><dd><a href={addressUrl(String(cover.holder))} target="_blank" rel="noreferrer"><code>{String(cover.holder)}</code></a></dd>
              <dt>Window</dt><dd>{String(cover.starts_at)} to {String(cover.expires_at)}</dd>
              <dt>Digest</dt><dd><code>{String(cover.source_sha256)}</code></dd>
              <dt>Source</dt><dd><a href={String(cover.source_url)} target="_blank" rel="noreferrer">Open source <ExternalLink size={12} /></a></dd>
            </dl>
            <p className="evidence-excerpt">{String(cover.source_excerpt || "No source snapshot stored yet.")}</p>
          </article>
          <CoverActions cover={cover} onFinalized={refresh} />
        </div>
      </section>
      <section className="panel" style={{ marginTop: 24 }}>
        <p className="eyebrow">Loss desk</p>
        <h2>Incidents</h2>
        <div className="incident-list">
          {incidents.length === 0 && <p className="muted">No incidents filed.</p>}
          {incidents.map((incident) => (
            <article key={String(incident.id)} className="incident-row">
              <span className={`badge ${statusTone(String(incident.status))}`}>{incidentLabel(String(incident.status))}</span>
              <strong>{String(incident.id)}</strong>
              <p>{String(incident.loss_summary)}</p>
              {incident.rationale && <small>{String(incident.rationale)}</small>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
