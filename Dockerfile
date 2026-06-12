FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shorten_url?schema=public
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=replace-with-openssl-rand-base64-32
ENV APP_BASE_URL=http://localhost:3000
ENV IP_HASH_SECRET=replace-with-openssl-rand-base64-32
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/vitest.config.ts ./vitest.config.ts
COPY --from=builder /app/playwright.config.ts ./playwright.config.ts
COPY --from=builder /app/tests ./tests
COPY --from=builder /app/.env.example ./.env.example

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npm run start"]
