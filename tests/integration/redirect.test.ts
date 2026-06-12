import { describe, expect, it } from "vitest";

import { isExpired, resolveRedirectFromRecord } from "@/server/redirect/service";

describe("resolveRedirectFromRecord", () => {
  const activeLink = {
    id: "link_1",
    originalUrl: "https://example.com",
    isActive: true,
    expiresAt: null as Date | null,
  };

  it("resolves active links", () => {
    expect(
      resolveRedirectFromRecord(activeLink, new Date("2026-06-12T00:00:00Z")),
    ).toEqual({
      status: "ok",
      shortLinkId: "link_1",
      destinationUrl: "https://example.com",
    });
  });

  it("marks inactive links unavailable", () => {
    expect(
      resolveRedirectFromRecord({ ...activeLink, isActive: false }, new Date()),
    ).toEqual({ status: "inactive" });
  });

  it("marks expired links expired", () => {
    expect(
      resolveRedirectFromRecord(
        { ...activeLink, expiresAt: new Date("2026-06-11T00:00:00Z") },
        new Date("2026-06-12T00:00:00Z"),
      ),
    ).toEqual({ status: "expired" });
  });

  it("treats exact expiration time as expired", () => {
    expect(
      isExpired(
        new Date("2026-06-12T00:00:00Z"),
        new Date("2026-06-12T00:00:00Z"),
      ),
    ).toBe(true);
  });
});
