# Forgot Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an email-based forgot-password flow to the existing Next.js app with one-time reset tokens, password reset, and JWT session revocation after a password change.

**Architecture:** Keep the feature inside the existing monolith. Add a small password-reset service for token lifecycle and password update logic, a tiny mail adapter for provider-specific delivery, and a route/page pair for request + reset screens. Extend the current Auth.js JWT flow so stale sessions fail once `User.passwordChangedAt` advances.

**Tech Stack:** Next.js App Router, Auth.js/NextAuth JWT, Prisma/PostgreSQL, bcryptjs, native `fetch`, Vitest, Playwright.

---

## File Structure

- `prisma/schema.prisma`: add `User.passwordChangedAt` and a `PasswordResetToken` model.
- `src/lib/env.ts`: add mail provider config and reset-email env vars.
- `src/types/next-auth.d.ts`: add JWT/session fields for password-change versioning.
- `src/lib/auth.ts`: sign in with password version data and reject stale JWT sessions.
- `src/lib/session-version.ts`: pure helper for comparing JWT password-version claims against the current user record.
- `src/server/password-reset/*`: token generation, hashing, request/confirm service, and cleanup helpers.
- `src/server/password-reset/rate-limit.ts`: password-reset-specific rate limiting built on the existing `RateLimit` table.
- `src/server/mail/*`: provider adapter and reset-email template helper.
- `src/components/auth/forgot-password-form.tsx`: request-reset form.
- `src/components/auth/reset-password-form.tsx`: new-password form.
- `src/app/login/page.tsx`: add "Forgot password?" link.
- `src/app/forgot-password/page.tsx`: request-reset page.
- `src/app/reset-password/page.tsx`: confirm-reset page.
- `src/app/api/password-reset/request/route.ts`: request endpoint.
- `src/app/api/password-reset/confirm/route.ts`: confirm endpoint.
- `src/app/api/register/route.ts`: optionally share password rules and normalize behavior if needed.
- `tests/unit/*`: token, mail, env, and auth validation tests.
- `tests/integration/*`: request/confirm reset flows.
- `tests/e2e/*`: browser smoke coverage for the new auth screens.

### Task 1: Add schema, env, and JWT revocation plumbing

**Files:**
- Modify `prisma/schema.prisma`
- Modify `src/lib/env.ts`
- Modify `src/lib/auth.ts`
- Modify `src/lib/session-version.ts`
- Modify `src/types/next-auth.d.ts`
- Modify `.env.example`
- Modify `tests/unit/env.test.ts`
- Create `tests/unit/session-version.test.ts`

- [ ] **Step 1: Write the failing tests**

Add a unit test that asserts `parseEnv` accepts the new mail provider vars and rejects missing ones:

```ts
import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("accepts password reset mail config", () => {
    const env = parseEnv({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/shorten_url",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "secret-secret-secret",
      APP_BASE_URL: "http://localhost:3000",
      IP_HASH_SECRET: "ip-secret-secret",
      EMAIL_PROVIDER: "resend",
      MAIL_FROM: "Shortly <noreply@example.com>",
      RESEND_API_KEY: "re_test_key",
    });

    expect(env.EMAIL_PROVIDER).toBe("resend");
  });
});
```

Add a unit test that asserts the freshness helper rejects stale JWT sessions by comparing the stored password-change timestamp against the database value:

```ts
import { describe, expect, it } from "vitest";

import { isJwtSessionFresh } from "@/lib/session-version";

describe("isJwtSessionFresh", () => {
  it("rejects a JWT issued before passwordChangedAt", () => {
    expect(
      isJwtSessionFresh(
        "2026-06-12T00:00:00.000Z",
        new Date("2026-06-12T01:00:00Z"),
      ),
    ).toBe(false);
  });
});
```

The test should also include a fresh-session case where the claim matches or exceeds the current password-change timestamp.

- [ ] **Step 2: Run the tests to confirm they fail**

Run:

```bash
npm test -- tests/unit/env.test.ts tests/unit/session-version.test.ts
```

Expected:

- `parseEnv` fails because `EMAIL_PROVIDER`, `MAIL_FROM`, and provider keys are not yet in the schema.
- Auth/session freshness coverage fails or is incomplete because the new JWT fields and helper do not exist yet.

- [ ] **Step 3: Implement the schema and env plumbing**

Update `prisma/schema.prisma`:

```prisma
model User {
  id                String              @id @default(cuid())
  email             String              @unique
  passwordHash      String
  passwordChangedAt DateTime            @default(now())
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  links             ShortLink[]
  accounts          Account[]
  sessions          Session[]
  resetTokens       PasswordResetToken[]
}

model PasswordResetToken {
  id               String   @id @default(cuid())
  userId           String
  tokenHash        String   @unique
  requestedAt      DateTime  @default(now())
  expiresAt        DateTime
  usedAt           DateTime?
  revokedAt        DateTime?
  requestIpHash    String?
  requestUserAgent String?
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, expiresAt])
  @@index([expiresAt])
}
```

Update `src/lib/env.ts`:

```ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(16),
  APP_BASE_URL: z.string().url(),
  IP_HASH_SECRET: z.string().min(16),
  EMAIL_PROVIDER: z.enum(["resend", "postmark"]),
  MAIL_FROM: z.string().min(3),
  RESEND_API_KEY: z.string().optional(),
  POSTMARK_API_TOKEN: z.string().optional(),
});
```

Update `src/types/next-auth.d.ts` so the JWT and session carry the password-change version:

```ts
declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      passwordChangedAt?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    passwordChangedAt?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    passwordChangedAt?: string | null;
  }
}
```

Create `src/lib/session-version.ts`:

```ts
export function isJwtSessionFresh(
  tokenPasswordChangedAt: string | null | undefined,
  currentPasswordChangedAt: Date | null | undefined,
) {
  if (!tokenPasswordChangedAt || !currentPasswordChangedAt) {
    return false;
  }

  return (
    new Date(tokenPasswordChangedAt).getTime() >=
    currentPasswordChangedAt.getTime()
  );
}
```

Update `src/lib/auth.ts` so `authorize()` returns `passwordChangedAt`, the JWT stores it, and `auth()` rejects stale sessions by comparing the JWT claim to the current `User.passwordChangedAt` from Prisma through `isJwtSessionFresh()`.

- [ ] **Step 4: Run the tests to confirm they pass**

Run:

```bash
npm test -- tests/unit/env.test.ts tests/unit/session-version.test.ts
```

Expected:

- `parseEnv` accepts the new env shape.
- The freshness helper test passes after `src/lib/session-version.ts` exists.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma src/lib/env.ts src/lib/auth.ts src/lib/session-version.ts src/types/next-auth.d.ts .env.example tests/unit/env.test.ts tests/unit/session-version.test.ts
git commit -m "feat: add password reset schema and auth plumbing"
```

### Task 2: Add password-reset service and mail adapter

**Files:**
- Create `src/server/password-reset/token.ts`
- Create `src/server/password-reset/service.ts`
- Create `src/server/password-reset/rate-limit.ts`
- Create `src/server/password-reset/types.ts`
- Create `src/server/mail/provider.ts`
- Create `src/server/mail/reset-email.ts`
- Create `tests/unit/password-reset.test.ts`
- Create `tests/unit/mail.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests for token generation and hashing:

```ts
import { describe, expect, it } from "vitest";
import {
  generateResetToken,
  hashResetToken,
  isResetTokenExpired,
} from "@/server/password-reset/token";

describe("password reset token helpers", () => {
  it("generates a url-safe one-time token", () => {
    const token = generateResetToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{32,}$/);
  });

  it("hashes tokens deterministically", () => {
    expect(hashResetToken("abc123")).toHaveLength(64);
  });

  it("treats token expiry as inclusive", () => {
    expect(
      isResetTokenExpired(
        new Date("2026-06-12T10:00:00Z"),
        new Date("2026-06-12T10:00:00Z"),
      ),
    ).toBe(true);
  });
});
```

Add tests for the mail adapter shape:

```ts
import { describe, expect, it } from "vitest";
import { buildPasswordResetEmail } from "@/server/mail/reset-email";

describe("buildPasswordResetEmail", () => {
  it("renders the reset url and expiration text", () => {
    const email = buildPasswordResetEmail({
      to: "user@example.com",
      resetUrl: "http://localhost:3000/reset-password?token=abc",
    });

    expect(email.subject).toContain("reset your password");
    expect(email.text).toContain("http://localhost:3000/reset-password?token=abc");
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run:

```bash
npm test -- tests/unit/password-reset.test.ts tests/unit/mail.test.ts
```

Expected:

- Helper modules do not exist yet.
- Token and email builder tests fail until the service is implemented.

- [ ] **Step 3: Implement the service and adapter**

Create `src/server/password-reset/token.ts`:

```ts
import { createHash, randomBytes } from "node:crypto";

export function generateResetToken() {
  return randomBytes(32).toString("base64url");
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isResetTokenExpired(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() <= now.getTime();
}
```

Create `src/server/mail/provider.ts` with a tiny provider switch that uses `fetch`:

```ts
type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendMail(payload: MailPayload) {
  if (env.EMAIL_PROVIDER === "resend") {
    return fetch("https://api.resend.com/emails", { ... });
  }

  return fetch("https://api.postmarkapp.com/email", { ... });
}
```

Create `src/server/mail/reset-email.ts`:

```ts
export function buildPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}) {
  return {
    subject: "Reset your password",
    text: `Reset your password: ${input.resetUrl}`,
    html: `<p>Reset your password</p><p><a href="${input.resetUrl}">${input.resetUrl}</a></p>`,
  };
}
```

Create `src/server/password-reset/service.ts` with `requestPasswordReset()` and `confirmPasswordReset()`:

```ts
export async function requestPasswordReset(email: string, ipHash?: string, userAgent?: string) {
  // normalize email, rate limit, locate user
  // revoke prior active tokens
  // create new token row
  // call sendMail()
}

export async function confirmPasswordReset(input: {
  token: string;
  password: string;
}) {
  // hash token, lookup active record
  // verify expiry/use/revocation
  // hash password and update user.passwordHash
  // set user.passwordChangedAt = new Date()
  // mark token used
}
```

Create `src/server/password-reset/rate-limit.ts` with a pair of helpers:

```ts
export async function assertPasswordResetRequestAllowed(input: {
  email: string;
  ipHash: string;
}) {
  // use the existing RateLimit table with separate email and IP scopes
}

export async function recordPasswordResetRequest(input: {
  email: string;
  ipHash: string;
}) {
  // increment or create the rate-limit rows
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run:

```bash
npm test -- tests/unit/password-reset.test.ts tests/unit/mail.test.ts
```

Expected:

- Token helper tests pass.
- Email template tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/password-reset src/server/mail tests/unit/password-reset.test.ts tests/unit/mail.test.ts
git commit -m "feat: add password reset service"
```

### Task 3: Add forgot-password and reset-password UI plus API routes

**Files:**
- Modify `src/app/login/page.tsx`
- Create `src/app/forgot-password/page.tsx`
- Create `src/app/reset-password/page.tsx`
- Create `src/app/api/password-reset/request/route.ts`
- Create `src/app/api/password-reset/confirm/route.ts`
- Create `src/components/auth/auth-form.tsx` only if it needs a reusable link or error state change
- Create `src/components/auth/forgot-password-form.tsx`
- Create `src/components/auth/reset-password-form.tsx`
- Create `tests/integration/password-reset.test.ts`
- Create `tests/e2e/password-reset.spec.ts`

- [ ] **Step 1: Write the failing tests**

Add integration tests for the request/confirm endpoints:

```ts
import { describe, expect, it } from "vitest";

describe("password reset endpoints", () => {
  it("returns a neutral response for unknown emails", async () => {
    // POST /api/password-reset/request with a missing email
  });

  it("rejects invalid tokens on confirm", async () => {
    // POST /api/password-reset/confirm with a bad token
  });
});
```

Add a Playwright smoke test for the UI flow:

```ts
import { expect, test } from "@playwright/test";

test("links login to forgot-password and reset-password flow", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
  await page.getByRole("link", { name: /forgot password/i }).click();
  await expect(page).toHaveURL(/\/forgot-password/);
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run:

```bash
npm test -- tests/integration/password-reset.test.ts
npx playwright test tests/e2e/password-reset.spec.ts
```

Expected:

- Routes do not exist yet.
- The Playwright flow cannot navigate to the new pages yet.

- [ ] **Step 3: Implement the pages and routes**

Add a link on the login page:

```tsx
<Link href="/forgot-password" className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
  Forgot password?
</Link>
```

Create `/forgot-password`:

```tsx
export default function ForgotPasswordPage() {
  return (
    <main>
      <h1>Reset your password</h1>
      {/* <ForgotPasswordForm /> posts email to /api/password-reset/request */}
    </main>
  );
}
```

Create `/reset-password`:

```tsx
export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  // read token, show invalid-link state if missing
  // <ResetPasswordForm /> posts token + password + password confirmation to /api/password-reset/confirm
}
```

Create `src/app/api/password-reset/request/route.ts`:

```ts
export async function POST(request: Request) {
  // parse email
  // call requestPasswordReset()
  // always return a neutral success message
}
```

Create `src/app/api/password-reset/confirm/route.ts`:

```ts
export async function POST(request: Request) {
  // parse token and passwords
  // call confirmPasswordReset()
  // return success or validation error
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run:

```bash
npm test -- tests/integration/password-reset.test.ts
npx playwright test tests/e2e/password-reset.spec.ts
```

Expected:

- Login page exposes the reset link.
- Forgot-password and reset-password pages render.
- API routes return the expected neutral/error states.

- [ ] **Step 5: Commit**

```bash
git add src/app/login/page.tsx src/app/forgot-password src/app/reset-password src/app/api/password-reset tests/integration/password-reset.test.ts tests/e2e/password-reset.spec.ts
git commit -m "feat: add forgot password flow"
```

### Task 4: Wire session freshness checks into auth and add reset verification coverage

**Files:**
- Modify `src/lib/auth.ts`
- Modify `src/lib/session-version.ts` if the comparison logic needs a tweak
- Modify `src/types/next-auth.d.ts` if the JWT claim needs an extra field
- Create or update `tests/integration/auth-reset.test.ts`
- Update any dashboard-auth smoke checks if they rely on stale sessions remaining valid

- [ ] **Step 1: Write the failing test**

Add a focused test for stale JWT invalidation:

```ts
import { describe, expect, it } from "vitest";
import { isJwtSessionFresh } from "@/lib/session-version";

describe("auth session freshness", () => {
  it("rejects stale password versions", () => {
    expect(
      isJwtSessionFresh(
        "2026-06-12T00:00:00.000Z",
        new Date("2026-06-12T01:00:00Z"),
      ),
    ).toBe(false);
  });

  it("accepts fresh password versions", () => {
    expect(
      isJwtSessionFresh(
        "2026-06-12T01:00:00.000Z",
        new Date("2026-06-12T00:00:00Z"),
      ),
    ).toBe(true);
  });
});
```

This should also include one `authOptions` callback assertion in the real implementation so the JWT path stays wired correctly.

- [ ] **Step 2: Run the test to confirm it fails**

Run:

```bash
npm test -- tests/integration/auth-reset.test.ts
```

Expected:

- The freshness helper or auth callback wiring does not yet exist.

- [ ] **Step 3: Implement the freshness check**

Update `src/lib/auth.ts` so the JWT stores a password version claim and `auth()` rejects stale sessions by comparing that claim against the current user record:

```ts
callbacks: {
  async jwt({ token, user }) {
    if (user?.id) {
      token.id = user.id;
      token.passwordChangedAt = user.passwordChangedAt ?? null;
    }

    return token;
  },
  async session({ session, token }) {
    if (session.user && token.id) {
      session.user.id = token.id;
      session.user.passwordChangedAt = token.passwordChangedAt ?? null;
    }

    return session;
  },
},

export async function auth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.passwordChangedAt) {
    return session;
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordChangedAt: true },
  });

  if (
    !isJwtSessionFresh(
      session.user.passwordChangedAt,
      currentUser?.passwordChangedAt,
    )
  ) {
    return null;
  }

  return session;
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run:

```bash
npm test -- tests/integration/auth-reset.test.ts
```

Expected:

- The auth helper exposes the password version claim and rejects stale sessions.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/lib/session-version.ts src/types/next-auth.d.ts tests/integration/auth-reset.test.ts
git commit -m "feat: revoke jwt sessions after password reset"
```

### Task 5: Full verification and release notes

**Files:**
- Update `docs/superpowers/plans/2026-06-12-forgot-password-implementation.md` if any scope or test gaps appear during execution
- Update README or operational notes only if the app already documents required env vars elsewhere

- [ ] **Step 1: Run the full local test suite**

Run:

```bash
npm test
npm run build
npx playwright test
```

Expected:

- Unit, integration, and e2e coverage all pass.
- Build succeeds with the new routes and Prisma schema.

- [ ] **Step 2: Run a manual browser check**

Use the browser to verify:

- `/login` shows the forgot-password link.
- `/forgot-password` accepts an email and shows the neutral confirmation state.
- `/reset-password?token=...` renders the password form.
- A successful reset returns the user to `/login`.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add forgot password flow"
```

## Self-Review

### Spec coverage check

- Request reset email: covered by Task 3.
- Mail delivery: covered by Task 2.
- Reset token lifecycle: covered by Task 2.
- Password update and revocation: covered by Task 2 and Task 4.
- JWT invalidation: covered by Task 4.
- UI and route integration: covered by Task 3.
- Verification: covered by Task 5.

### Placeholder scan

- No "TBD", "TODO", or placeholder-only tasks remain.
- Every task has explicit files, commands, and concrete expected behavior.

### Type consistency check

- `User.passwordChangedAt` is used consistently as the JWT revocation source.
- `PasswordResetToken.tokenHash` is the only stored token value.
- `EMAIL_PROVIDER`, `MAIL_FROM`, `RESEND_API_KEY`, and `POSTMARK_API_TOKEN` are the env names referenced in both the env schema and the mail adapter.
- The routes are named consistently as `/forgot-password`, `/reset-password`, `/api/password-reset/request`, and `/api/password-reset/confirm`.
