import { describe, expect, it } from "vitest";
import { isExpired } from "@/server/redirect/service";

describe("isExpired", () => {
  it("returns false when no expiration exists", () => {
    expect(isExpired(null, new Date("2026-06-12T00:00:00Z"))).toBe(false);
  });

  it("returns false before expiration", () => {
    expect(
      isExpired(
        new Date("2026-06-13T00:00:00Z"),
        new Date("2026-06-12T00:00:00Z"),
      ),
    ).toBe(false);
  });

  it("returns true at or after expiration", () => {
    expect(
      isExpired(
        new Date("2026-06-12T00:00:00Z"),
        new Date("2026-06-12T00:00:00Z"),
      ),
    ).toBe(true);
  });
});
