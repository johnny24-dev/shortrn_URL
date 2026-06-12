import { env } from "@/lib/env";

export function shortUrlForSlug(slug: string): string {
  return new URL(`/${slug}`, env.APP_BASE_URL).toString();
}
