import { describe, expect, it } from "vitest";

import { createShortLink } from "@/server/links/service";

describe("createShortLink", () => {
  it("normalizes URL and stores a custom slug", async () => {
    const link = await createShortLink({
      userId: "test-user",
      originalUrl: "https://example.com/a#fragment",
      customSlug: "launch",
      title: "Launch",
      description: null,
      expiresAt: null,
      skipPersistenceForTest: true,
    });

    expect(link.originalUrl).toBe("https://example.com/a");
    expect(link.slug).toBe("launch");
    expect(link.userId).toBe("test-user");
    expect(link.title).toBe("Launch");
  });
});
