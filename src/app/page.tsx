"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Banknote, LoaderCircle, Search, ShieldCheck, Waves } from "lucide-react";
import { CoverCard } from "@/components/cover-card";
import { QuoteCoverForm } from "@/components/quote-cover-form";
import { EMPTY_LEDGER, loadLedger } from "@/lib/paveron";

export default function Home() {
  const [ledger, setLedger] = useState(EMPTY_LEDGER);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadLedger()
      .then((next) => { setLedger(next); setError(undefined); })
      .catch((cause) => { setLedger(EMPTY_LEDGER); setError(cause instanceof Error ? cause.message : "Unable to load pool."); });
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const covers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ledger.covers;
    return ledger.covers.filter((cover) => `${String(cover.id)} ${String(cover.title)} ${String(cover.risk_domain)} ${String(cover.region)} ${String(cover.status)}`.toLowerCase().includes(needle));
  }, [ledger.covers, query]);

  return (
    <main className="pv-body">
      <section className="hero-grid">
        <div>
          <p className="eyebrow">Parametric cover pool</p>
          <h1>Soft insurance for hard-to-wait moments.</h1>
          <p className="lede">Paveron turns public signals into calm, time-boxed coverage capsules with reserved payout capacity and validator-resolved incident lanes.</p>
          <div className="searchbar">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search covers" />
          </div>
        </div>
        <div className="orbital-panel" aria-label="Pool reserve status">
          <div className="orbital-ring"><Waves size={42} /></div>
          <Metric icon={<Banknote size={18} />} label="Reserve" value={`${ledger.summary.reserve_balance ?? "0"} GEN`} />
          <Metric icon={<ShieldCheck size={18} />} label="Available" value={`${ledger.summary.available_capacity ?? "0"} GEN`} />
          <Metric icon={<Activity size={18} />} label="Incidents" value={String(ledger.summary.incident_count ?? "0")} />
        </div>
      </section>

      {error && <p className="pv-alert">{error}</p>}
      {loading && <p className="muted"><LoaderCircle className="spin" size={16} /> Reading pool...</p>}

      <section className="workspace-grid">
        <div>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Live coverage</p>
              <h2>Protected routes</h2>
            </div>
            <span className="soft-stat">{ledger.summary.active_count ?? "0"} active</span>
          </div>
          <div className="covers-grid">
            {covers.map((cover) => <CoverCard key={String(cover.id)} cover={cover} />)}
            {covers.length === 0 && !loading && !error && <EmptyPool />}
          </div>
        </div>
        <QuoteCoverForm onFinalized={refresh} />
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="metric">{icon}<span>{label}</span><strong>{value}</strong></div>;
}

function EmptyPool() {
  return (
    <article className="empty-state">
      <p className="eyebrow">No capsules yet</p>
      <h3>Seed reserve, then open the first cover.</h3>
      <p>Paveron intentionally avoids fake fallback data. When the contract is empty, the pool looks empty.</p>
    </article>
  );
}
