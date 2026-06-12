import { describe, expect, it } from "vitest";

import { assertDestinationAllowed } from "@/server/abuse/blocklist";

describe("assertDestinationAllowed", () => {
  it("allows public URLs", () => {
    expect(() => assertDestinationAllowed("https://example.com")).not.toThrow();
  });

  it("blocks localhost destinations", () => {
    expect(() => assertDestinationAllowed("http://localhost:3000")).toThrow(
      "Destination URL is blocked",
    );
  });

  it("blocks private IPv4 destinations", () => {
    expect(() => assertDestinationAllowed("http://192.168.0.1")).toThrow(
      "Destination URL is blocked",
    );
  });
});
