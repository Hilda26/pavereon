import { describe, expect, it } from "vitest";
import { EMPTY_LEDGER } from "@/lib/paveron";

describe("Paveron ledger fallback", () => {
  it("does not invent live covers when pool reads fail", () => {
    expect(EMPTY_LEDGER.summary.active_count).toBe("0");
    expect(EMPTY_LEDGER.summary.available_capacity).toBe("0");
    expect(EMPTY_LEDGER.covers).toEqual([]);
    expect(EMPTY_LEDGER.incidents).toEqual([]);
  });
});
