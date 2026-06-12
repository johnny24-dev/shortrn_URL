import { describe, expect, it } from "vitest";
import { generateSlug, validateCustomSlug } from "@/server/links/slug";

describe("slug helpers", () => {
  it("generates URL-safe slugs", () => {
    expect(generateSlug()).toMatch(/^[a-zA-Z0-9_-]{7}$/);
  });

  it("accepts valid custom slug", () => {
    expect(validateCustomSlug("summer-sale_2026")).toBe("summer-sale_2026");
  });

  it("rejects invalid custom slug", () => {
    expect(() => validateCustomSlug("bad slug!")).toThrow(
      "Slug can only contain letters, numbers, hyphens, and underscores",
    );
  });
});
