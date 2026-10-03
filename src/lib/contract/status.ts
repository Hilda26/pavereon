const COVER_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  INCIDENT_OPEN: "Incident open",
  PAID: "Paid",
  DENIED: "Denied",
  EXPIRED: "Expired",
  RETIRED: "Retired",
};

const INCIDENT_LABELS: Record<string, string> = {
  PENDING: "Pending",
  FULL_PAYOUT: "Full payout",
  PARTIAL_PAYOUT: "Partial payout",
  DENIED: "Denied",
  INCONCLUSIVE: "Inconclusive",
};

export function coverLabel(status: string) {
  return COVER_LABELS[status] ?? status.toLowerCase().replaceAll("_", " ");
}

export function incidentLabel(status: string) {
  return INCIDENT_LABELS[status] ?? status.toLowerCase().replaceAll("_", " ");
}

export function statusTone(status: string) {
  if (["ACTIVE", "FULL_PAYOUT", "PARTIAL_PAYOUT", "PAID"].includes(status)) return "aqua";
  if (["INCIDENT_OPEN", "PENDING"].includes(status)) return "violet";
  if (["DENIED", "EXPIRED", "RETIRED", "INCONCLUSIVE"].includes(status)) return "muted";
  return "glass";
}
