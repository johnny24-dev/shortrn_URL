export type RedirectResolution =
  | { status: "not_found" }
  | { status: "inactive" }
  | { status: "expired" }
  | { status: "ok"; destinationUrl: string; shortLinkId: string };

export function isExpired(expiresAt: Date | null, now = new Date()): boolean {
  return expiresAt !== null && expiresAt.getTime() <= now.getTime();
}
