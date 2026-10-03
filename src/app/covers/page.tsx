"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { CoverCard } from "@/components/cover-card";
import { loadLedger, type Ledger } from "@/lib/paveron";

export default function CoversPage() {
  const [ledger, setLedger] = useState<Ledger>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    await loadLedger()
      .then((next) => { setLedger(next); setError(undefined); })
      .catch((cause) => { setLedger(undefined); setError(cause instanceof Error ? cause.message : "Unable to load covers."); });
    setLoading(false);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <main className="pv-body">
      <Link className="back-link" href="/">Back to pool</Link>
      <p className="eyebrow" style={{ marginTop: 24 }}>All capsules</p>
      <h1>Coverage atlas</h1>
      {error && <p className="pv-alert">{error}</p>}
      {loading && !error && <p className="muted"><LoaderCircle className="spin" size={16} /> Reading covers...</p>}
      <div className="covers-grid wide">
        {(ledger?.covers ?? []).map((cover) => <CoverCard key={String(cover.id)} cover={cover} />)}
        {ledger && ledger.covers.length === 0 && !loading && !error && (
          <article className="empty-state">
            <p className="eyebrow">No covers yet</p>
            <h3>The atlas is ready for its first capsule.</h3>
            <p>Fund the reserve from the pool page, then open a time-boxed parametric cover.</p>
          </article>
        )}
      </div>
    </main>
  );
}
