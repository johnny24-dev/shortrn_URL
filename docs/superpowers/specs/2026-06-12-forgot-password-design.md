# Forgot Password Design

## Summary

Add a production-ready forgot-password flow to the existing Next.js + Auth.js + Prisma + PostgreSQL app.

The feature should let a logged-out user request a reset email from the login page, open a signed reset link from that email, set a new password, and have all existing sessions revoked after the password change.

## Goals

- Let users request a password reset from the login page.
- Send a reset link by email through Resend or Postmark.
- Let users open a public reset page and set a new password.
- Make each reset token one-time use and expire it after 1 hour.
- Revoke all existing JWT sessions after a successful password reset.
- Rate limit reset requests by email and IP.
- Prevent old reset links from working once a newer token is issued.

## Non-Goals

- Magic links for login.
- Social login changes.
- Admin-assisted password recovery.
- SMS-based recovery.
- Passwordless auth.
- Complex anti-abuse tooling beyond rate limits and token invalidation.

## Recommended Approach

Use the existing monolith and extend it with a small password-reset subsystem:

- The login page gets a "Forgot password?" link.
- `/forgot-password` accepts an email address and triggers the reset email flow.
- `/reset-password?token=...` verifies the token and sets a new password.
- Prisma stores hashed reset tokens, request timestamps, and expiry metadata.
- A mail provider adapter sends the reset email so the transport can be swapped later.

This keeps the implementation aligned with the current stack and avoids adding another service or queue.

## Routes

- `/login`: Add a "Forgot password?" link.
- `/forgot-password`: Email request form and success state.
- `/reset-password`: Public reset form that reads `token` from the query string.
- `/api/password-reset/request`: Create or replace a reset token and send the email.
- `/api/password-reset/confirm`: Validate token and update the password.

## Architecture Boundaries

### Password Reset Service

Responsibilities:

- Normalize the submitted email.
- Enforce per-email and per-IP rate limits.
- Generate a secure random token.
- Store only a hash of the token.
- Invalidate any prior active token for the same user.
- Record when the token was requested, expires, used, or revoked.
- Verify the token on reset submission.
- Hash the new password before saving it.
- Update the user's password-change timestamp so older JWT sessions stop being accepted.

### Mail Delivery

Responsibilities:

- Send reset email messages.
- Render the reset link into a template.
- Keep provider-specific details behind a narrow adapter.

The first implementation should support a single provider path, with the provider chosen by environment variables. The app should not depend on a specific vendor from the reset service.

### UI

Responsibilities:

- Keep the login page simple and familiar.
- Present a short request form on `/forgot-password`.
- Present a password update form on `/reset-password`.
- Show generic success/error messages that do not reveal whether an email exists.

## Data Model

### User

Add one field to support JWT revocation:

- `passwordChangedAt`

This timestamp is updated every time the password changes. It is used to reject JWT sessions that were issued before the latest password update.

### PasswordResetToken

Add a new model to track reset attempts and token state.

Fields:

- `id`
- `userId`
- `tokenHash`
- `requestedAt`
- `expiresAt`
- `usedAt`
- `revokedAt`
- `requestIpHash`
- `requestUserAgent`

Constraints:

- One active token per user at a time.
- `tokenHash` must be unique.
- Expired, used, or revoked tokens are never accepted.
- Raw reset tokens are never stored in the database.

### Session

The app currently uses JWT sessions, so password reset must invalidate sessions by comparing JWT issue time to `User.passwordChangedAt`. If the auth strategy later changes to database sessions, deleting session rows can be added as a secondary cleanup step.

### Optional Request Audit

If the rate limit implementation is kept in PostgreSQL, reuse the existing `RateLimit` table rather than adding a new one.

## Core Flows

### Request Reset Email

1. User opens `/forgot-password`.
2. User submits an email address.
3. Server normalizes the email and applies rate limits.
4. If the email exists, server creates a new one-time token, revokes older active tokens for that user, and sends a reset email.
5. If the email does not exist, server still returns the same success response to avoid account enumeration.
6. UI shows a neutral confirmation message.

### Open Reset Link

1. User clicks the email link.
2. `/reset-password?token=...` loads the reset form.
3. The page checks whether the token is present and structurally valid.
4. The form stays disabled or shows an invalid-link state if the token is missing or malformed.

### Submit New Password

1. User enters a new password and confirms it.
2. Server hashes the token and looks up the matching active reset record.
3. Server checks expiry, revocation, and use state.
4. Server hashes the new password with bcrypt.
5. Server updates the user password.
6. Server marks the reset token as used.
7. Server updates `User.passwordChangedAt` to the current time.
8. Server rejects the same token on future attempts.

## Error Handling

- Unknown email on reset request: respond with the same generic success message as known emails.
- Rate limit exceeded: return a neutral error on the request endpoint and a visible message in the UI.
- Invalid token: show a public invalid-link message on `/reset-password`.
- Expired token: show a public expired-link message on `/reset-password`.
- Used or revoked token: show a public invalid-link message.
- Password validation failure: show inline form errors and keep the token state intact.
- Mail provider failure: log the error server-side and return a generic failure without exposing mail provider internals.

## Security Rules

- Store only token hashes, never raw reset tokens.
- Use cryptographically random reset tokens.
- Use a 1-hour expiration window.
- Revoke old tokens when a new one is issued for the same user.
- Update `User.passwordChangedAt` on reset and reject JWT sessions issued before that timestamp.
- Hash request IPs before storing them.
- Do not reveal whether an email address is registered.
- Do not allow a password reset to proceed without a valid, active token.

## Testing

- Unit tests for token generation, token hashing, expiry checks, and rate-limit behavior.
- Unit tests for password policy validation and session revocation behavior.
- Integration tests for request-reset success, unknown-email neutrality, invalid-token rejection, expired-token rejection, and successful password update.
- Integration tests for old token invalidation when a newer token is issued.
- UI smoke tests for `/forgot-password` and `/reset-password`.
- Manual browser verification for the login link, email-request success state, and reset submission flow.

## Implementation Notes

- Reuse the existing `bcryptjs` dependency for password hashing.
- Add a small mail adapter module instead of calling the provider directly from route handlers.
- Keep the login/register pages visually consistent with the current auth screens.
- Preserve the current dashboard redirect behavior after password reset is complete by sending the user back to `/login`.
- Extend the existing NextAuth JWT callback and session validation path so stale tokens fail once the password-change timestamp advances.
