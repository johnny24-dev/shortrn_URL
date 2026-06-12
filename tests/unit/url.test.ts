import { describe, expect, it } from "vitest";
import { normalizeDestinationUrl } from "@/server/links/url";

describe("normalizeDestinationUrl", () => {
  it("normalizes http URLs", () => {
    expect(normalizeDestinationUrl("https://example.com/path?x=1")).toBe(
      "https://example.com/path?x=1",
    );
  });

  it("rejects missing protocols", () => {
    expect(() => normalizeDestinationUrl("example.com")).toThrow(
      "URL must include http:// or https://",
    );
  });

  it("rejects non-http protocols", () => {
    expect(() => normalizeDestinationUrl("javascript:alert(1)")).toThrow(
      "Only http and https URLs are allowed",
    );
  });
});
