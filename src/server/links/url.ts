export function normalizeDestinationUrl(input: string): string {
  const trimmed = input.trim();

  if (!/^https?:\/\//i.test(trimmed)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      throw new Error("Only http and https URLs are allowed");
    }

    throw new Error("URL must include http:// or https://");
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("URL is invalid");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }

  url.hash = "";
  return url.toString();
}
