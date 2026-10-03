import { describe, expect, it } from "vitest";
import { isCoverId, isHttpsUrl } from "@/lib/validation/url";

describe("Paveron input validation", () => {
  it("accepts only https urls", () => {
    expect(isHttpsUrl("https://example.com/report")).toBe(true);
    expect(isHttpsUrl("http://example.com/report")).toBe(false);
    expect(isHttpsUrl("not a url")).toBe(false);
  });

  it("keeps cover ids route-safe and contract-safe", () => {
    expect(isCoverId("rain-delay-cover_1")).toBe(true);
    expect(isCoverId("ab")).toBe(false);
    expect(isCoverId("bad/id")).toBe(false);
  });
});
