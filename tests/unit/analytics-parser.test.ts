import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { extractClickMetadata, hashIp } from "@/server/analytics/parser";

const IP_HASH_SECRET = "test-ip-secret";
const IP_ADDRESS = "203.0.113.10";
const IPHONE_SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

describe("extractClickMetadata", () => {
  it("extracts request metadata without returning a raw IP address", () => {
    const headers = new Headers({
      referer: "https://referrer.example/path",
      "user-agent": IPHONE_SAFARI_UA,
      "x-forwarded-for": `${IP_ADDRESS}, 198.51.100.22`,
      "x-vercel-ip-country": "VN",
    });

    const metadata = extractClickMetadata(headers, IP_HASH_SECRET);

    expect(metadata).toEqual({
      browser: "Mobile Safari",
      country: "VN",
      device: "mobile",
      ipHash: hashIp(IP_ADDRESS, IP_HASH_SECRET),
      referrer: "https://referrer.example/path",
      userAgent: IPHONE_SAFARI_UA,
    });
    expect(JSON.stringify(metadata)).not.toContain(IP_ADDRESS);
  });

  it("falls back to x-real-ip when x-forwarded-for is missing", () => {
    const headers = new Headers({
      "x-real-ip": "198.51.100.22",
    });

    const metadata = extractClickMetadata(headers, IP_HASH_SECRET);

    expect(metadata.ipHash).toBe(hashIp("198.51.100.22", IP_HASH_SECRET));
    expect(metadata.device).toBe("desktop");
  });
});

describe("hashIp", () => {
  it("returns an HMAC SHA-256 hex digest", () => {
    const expected = createHmac("sha256", IP_HASH_SECRET)
      .update(IP_ADDRESS)
      .digest("hex");

    expect(hashIp(IP_ADDRESS, IP_HASH_SECRET)).toBe(expected);
  });
});
