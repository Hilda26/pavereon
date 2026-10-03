import { describe, expect, it } from "vitest";
import { coverLabel, incidentLabel, statusTone } from "@/lib/contract/status";

describe("Paveron status helpers", () => {
  it("labels cover states for readers", () => {
    expect(coverLabel("ACTIVE")).toBe("Active");
    expect(coverLabel("INCIDENT_OPEN")).toBe("Incident open");
    expect(coverLabel("PAID")).toBe("Paid");
  });

  it("maps active, incident, and closed states to distinct tones", () => {
    expect(statusTone("ACTIVE")).toBe("aqua");
    expect(statusTone("INCIDENT_OPEN")).toBe("violet");
    expect(statusTone("DENIED")).toBe("muted");
  });

  it("labels incident payout outcomes", () => {
    expect(incidentLabel("FULL_PAYOUT")).toBe("Full payout");
    expect(incidentLabel("INCONCLUSIVE")).toBe("Inconclusive");
  });
});
