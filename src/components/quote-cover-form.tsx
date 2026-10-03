"use client";

import { useState } from "react";
import { Coins, PlusCircle } from "lucide-react";
import { NetworkGuard, useNetworkGuard } from "@/components/network-guard";
import { TxLifecycleList } from "@/components/tx-lifecycle";
import { useWalletAction } from "@/components/wallet-action";
import { isCoverId, isHttpsUrl } from "@/lib/validation/url";

export function QuoteCoverForm({ onFinalized }: { onFinalized: () => Promise<void> }) {
  const [coverId, setCoverId] = useState("lagos-rain-delay-72h");
  const [title, setTitle] = useState("Lagos small-business rain delay cover");
  const [riskDomain, setRiskDomain] = useState("Weather logistics");
  const [region, setRegion] = useState("Lagos, Nigeria");
  const [trigger, setTrigger] = useState("Pays if public weather data reports rainfall severe enough to disrupt same-day delivery routes for at least 72 hours during the covered window.");
  const [sourceUrl, setSourceUrl] = useState("https://example.com/weather-feed");
  const [startsAt, setStartsAt] = useState("2026-11-01T00:00:00.000Z");
  const [expiresAt, setExpiresAt] = useState("2026-12-01T00:00:00.000Z");
  const [premium, setPremium] = useState("2");
  const [payoutCap, setPayoutCap] = useState("8");
  const [reserveTopup, setReserveTopup] = useState("20");
  const { error, transactions, send } = useWalletAction(onFinalized);
  const { wrongNetwork } = useNetworkGuard();

  const valid = isCoverId(coverId)
    && title.trim().length >= 16
    && riskDomain.trim().length >= 3
    && region.trim().length >= 2
    && trigger.trim().length >= 80
    && isHttpsUrl(sourceUrl)
    && Number.parseInt(premium || "0", 10) > 0
    && Number.parseInt(payoutCap || "0", 10) > 0;

  return (
    <section className="panel submit-panel">
      <p className="eyebrow">Coverage capsule</p>
      <h2>Buy parametric cover</h2>
      <NetworkGuard />
      {error && <p className="form-error">{error}</p>}
      <div className="reserve-box">
        <div>
          <span>Pool capacity</span>
          <strong>{reserveTopup} GEN</strong>
        </div>
        <button type="button" className="quiet" disabled={wrongNetwork} onClick={() => void send("Fund reserve", "fund_reserve", [], BigInt(reserveTopup || "0"))}>
          <Coins size={16} /> Top up
        </button>
      </div>
      <form onSubmit={(event) => {
        event.preventDefault();
        if (!valid) return;
        void send(
          "Open cover",
          "open_cover",
          [coverId.trim(), title.trim(), riskDomain.trim(), region.trim(), trigger.trim(), sourceUrl.trim(), startsAt.trim(), expiresAt.trim(), BigInt(payoutCap)],
          BigInt(premium)
        );
      }}>
        <label>Cover ID<input value={coverId} onChange={(event) => setCoverId(event.target.value)} /></label>
        <label>Cover title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <div className="form-grid">
          <label>Risk domain<input value={riskDomain} onChange={(event) => setRiskDomain(event.target.value)} /></label>
          <label>Region<input value={region} onChange={(event) => setRegion(event.target.value)} /></label>
        </div>
        <label>Parametric trigger<textarea value={trigger} onChange={(event) => setTrigger(event.target.value)} /></label>
        <label>Public source URL<input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} /></label>
        <div className="form-grid">
          <label>Premium<input inputMode="numeric" value={premium} onChange={(event) => setPremium(event.target.value.replace(/\D/g, ""))} /></label>
          <label>Payout cap<input inputMode="numeric" value={payoutCap} onChange={(event) => setPayoutCap(event.target.value.replace(/\D/g, ""))} /></label>
        </div>
        <label>Starts<input value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></label>
        <label>Expires<input value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label>
        <button disabled={!valid || wrongNetwork}><PlusCircle size={16} /> Open cover</button>
      </form>
      <TxLifecycleList transactions={transactions} />
    </section>
  );
}
