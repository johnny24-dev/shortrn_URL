import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    env: {
      APP_BASE_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/shorten_url",
      IP_HASH_SECRET: "ip-secret-secret",
      NEXTAUTH_SECRET: "secret-secret-secret",
      NEXTAUTH_URL: "http://localhost:3000",
    },
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
