import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";
const nanoid = customAlphabet(alphabet, 7);
const customSlugPattern = /^[a-zA-Z0-9_-]{3,64}$/;

export function generateSlug(): string {
  return nanoid();
}

export function validateCustomSlug(input: string): string {
  const slug = input.trim();

  if (!customSlugPattern.test(slug)) {
    throw new Error(
      "Slug can only contain letters, numbers, hyphens, and underscores",
    );
  }

  return slug;
}
