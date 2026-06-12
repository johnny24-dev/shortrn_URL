import { describe, expect, it } from "vitest";

import { isJwtSessionFresh } from "@/lib/session-version";

describe("isJwtSessionFresh", () => {
  it("rejects a JWT issued before passwordChangedAt", () => {
    expect(
      isJwtSessionFresh(
        "2026-06-12T00:00:00.000Z",
        new Date("2026-06-12T01:00:00Z"),
      ),
    ).toBe(false);
  });

  it("accepts a JWT that matches the current passwordChangedAt", () => {
    expect(
      isJwtSessionFresh(
        "2026-06-12T01:00:00.000Z",
        new Date("2026-06-12T01:00:00Z"),
      ),
    ).toBe(true);
  });
});
