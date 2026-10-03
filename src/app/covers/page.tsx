"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { CoverCard } from "@/components/cover-card";
import { loadLedger, type Ledger } from "@/lib/paveron";

export default function CoversPage() {
  const [ledger, setLedger] = useState<Ledger>();
  const [error, setError] = useState<string>();
  const refresh = useCallback(async () => {
    await loadLedger().then((next) => { setLedger(next); setError(undefined); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load covers."));
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <main className="pv-body">
      <Link className="back-link" href="/">Back to pool</Link>
      <p className="eyebrow" style={{ marginTop: 24 }}>All capsules</p>
      <h1>Coverage atlas</h1>
      {error && <p className="pv-alert">{error}</p>}
      {!ledger && !error && <p className="muted"><LoaderCircle className="spin" size={16} /> Reading covers...</p>}
      <div className="covers-grid wide">
        {(ledger?.covers ?? []).map((cover) => <CoverCard key={String(cover.id)} cover={cover} />)}
      </div>
    </main>
  );
}
