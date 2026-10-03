import Link from "next/link";
import { ExternalLink, ShieldCheck, Umbrella } from "lucide-react";
import type { Cover } from "@/lib/paveron";
import { coverLabel, statusTone } from "@/lib/contract/status";

export function CoverCard({ cover }: { cover: Cover }) {
  const status = String(cover.status);
  return (
    <article className="cover-card">
      <div className="cover-card-top">
        <span className={`badge ${statusTone(status)}`}>{coverLabel(status)}</span>
        {status === "ACTIVE" ? <ShieldCheck size={18} /> : <Umbrella size={18} />}
      </div>
      <h3><Link href={`/covers/${String(cover.id)}`}>{String(cover.title)}</Link></h3>
      <p>{String(cover.risk_domain)} · {String(cover.region)}</p>
      <div className="cover-meter" aria-label="Reserved payout capacity">
        <span style={{ width: `${Math.min(100, Math.max(12, Number(cover.reserved_payout ?? 0) * 8))}%` }} />
      </div>
      <div className="cover-meta">
        <span>Cap {String(cover.payout_cap ?? "0")} GEN</span>
        <a href={String(cover.source_url)} target="_blank" rel="noreferrer">Source <ExternalLink size={12} /></a>
      </div>
    </article>
  );
}
