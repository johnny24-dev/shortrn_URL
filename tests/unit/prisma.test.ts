import { describe, expect, it } from "vitest";

describe("prisma singleton", () => {
  it("can be imported with valid environment variables", async () => {
    const { prisma } = await import("@/lib/prisma");

    expect(prisma).toBeDefined();
  });
});
