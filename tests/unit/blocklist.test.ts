import { describe, expect, it } from "vitest";

import { assertUrlAllowed } from "@/server/abuse/blocklist";

describe("assertUrlAllowed", () => {
  it("allows public URLs", () => {
    expect(() => assertUrlAllowed("https://example.com")).not.toThrow();
  });

  it("blocks localhost destinations", () => {
    expect(() => assertUrlAllowed("http://localhost:3000")).toThrow(
      "Destination URL is blocked",
    );
  });

  it("blocks private IPv4 destinations", () => {
    expect(() => assertUrlAllowed("http://192.168.0.1")).toThrow(
      "Destination URL is blocked",
    );
  });
});
