# URL Shortener Design

## Summary

Build a production-oriented URL shortener with Next.js, Auth.js, Prisma, and PostgreSQL. The first version is a small SaaS-style app with user accounts, a table-first dashboard, custom slugs, optional expiration dates, QR codes, and useful click analytics.

The app should be deployable as a single Next.js App Router application. It should avoid premature infrastructure such as a separate backend service, queue, or custom domain verification, while keeping service boundaries clear enough to add those later.

## Goals

- Let users register, log in, and manage their own short links.
- Let users create short links from normalized destination URLs.
- Support generated slugs and user-defined custom slugs.
- Support optional expiration dates and manual disable/delete actions.
- Redirect public short links with low latency.
- Record click analytics without blocking redirect success.
- Show operational dashboard metrics, link management, per-link insights, and QR download.
- Add basic abuse protection through validation, simple blocklist checks, and rate limiting.

## Non-Goals

- Custom domains in the first version.
- Queue or background worker infrastructure in the first version.
- Full marketing site with pricing, FAQ, or long-form sales sections.
- Advanced QR customization, logo embedding, or QR-specific analytics.
- Admin moderation, abuse reports, malware-provider integration, or audit logs.
- Public API keys or developer API access.

## Recommended Approach

Use a Next.js App Router monolith:

- Frontend pages, route handlers, server actions, auth, redirect logic, and dashboard live in one app.
- Prisma owns schema and database access.
- PostgreSQL is the primary data store.
- Auth.js/NextAuth handles sessions and authentication.
- Internal service modules separate auth, links, redirect, analytics, QR, and abuse-protection logic.

This approach keeps deployment and development simple while still producing a realistic product structure. Redirect and analytics should be implemented behind service functions so click recording can later move to a queue or edge-friendly path without rewriting dashboard code.

## Routes

- `/`: Minimal landing page with a headline, URL entry or primary call to action, and login/register links.
- `/login`: Login page.
- `/register`: Registration page.
- `/dashboard`: Main table-first command center for links and analytics.
- `/dashboard/links/[id]`: Optional deep-link route for opening the dashboard with a selected link. Do not build a separate detail page in version one unless routing state requires it.
- `/:slug`: Public redirect route.

## Architecture Boundaries

### Auth

Responsibilities:

- Register users with email/password.
- Hash passwords before storage.
- Authenticate users and maintain sessions through Auth.js.
- Protect dashboard routes and server actions.
- Keep schema compatible with adding OAuth later.

### Links

Responsibilities:

- Normalize and validate destination URLs.
- Generate random slugs.
- Validate custom slugs.
- Enforce slug uniqueness.
- Store title, description, status, expiration, and ownership.
- Disable, delete, and update existing links.

### Redirect

Responsibilities:

- Resolve a slug to an active short link.
- Reject missing, inactive, or expired links.
- Return public not-found or expired responses without exposing owner data.
- Redirect valid links to their destination quickly.
- Trigger analytics recording as best-effort work.

### Analytics

Responsibilities:

- Record click events from request headers and user-agent data.
- Store referrer, country, device, browser, hashed IP, and timestamp.
- Provide aggregate metrics for dashboard cards, tables, and selected-link insight panels.
- Fail silently from the redirect user's perspective while logging server-side errors.

### QR

Responsibilities:

- Generate QR codes for each short link.
- Support viewing and downloading QR output from the dashboard.
- Avoid QR-specific analytics in the first version.

### Abuse Protection

Responsibilities:

- Reject invalid or unsafe URLs.
- Block obvious unsafe destination patterns through a simple blocklist.
- Rate limit link creation and redirect traffic by IP/session.
- Allow inactive links so users can disable abuse-prone links manually.

## Data Model

### User

Stores account identity and ownership.

Fields:

- `id`
- `email`
- `passwordHash`
- `createdAt`
- `updatedAt`

Relationships:

- Has many `ShortLink` records.

Auth.js may require additional account/session tables depending on the selected adapter setup. The schema should allow adding OAuth accounts later without changing core link ownership.

### ShortLink

Stores the user-managed short link.

Fields:

- `id`
- `userId`
- `originalUrl`
- `slug`
- `title`
- `description`
- `isActive`
- `expiresAt`
- `createdAt`
- `updatedAt`

Constraints:

- `slug` is unique for the default application domain.
- `userId` references `User`.
- `originalUrl` must be a normalized absolute URL.

Design note:

Custom domains are out of scope for version one. Service and URL-generation code should still avoid scattering hard-coded domain assumptions so a future `{ domain, slug }` uniqueness model can be introduced cleanly.

### ClickEvent

Stores redirect analytics.

Fields:

- `id`
- `shortLinkId`
- `clickedAt`
- `referrer`
- `country`
- `device`
- `browser`
- `ipHash`
- `userAgent`

Constraints:

- `shortLinkId` references `ShortLink`.
- Raw IP addresses are not stored.

### RateLimit

Tracks basic abuse limits if implemented in PostgreSQL for the first version.

Fields:

- `id`
- `key`
- `scope`
- `count`
- `windowStart`
- `expiresAt`

Design note:

For a simple deployment, PostgreSQL-backed limits are acceptable. If redirect volume grows, move this responsibility to Redis or another low-latency store.

## Core Flows

### Create Short Link

1. Authenticated user opens dashboard and submits destination URL.
2. User may optionally provide custom slug, title, description, and expiration date.
3. Server validates and normalizes the URL.
4. Server checks blocklist and rate limit.
5. Server validates slug format and uniqueness.
6. Server creates `ShortLink`.
7. UI shows the short URL, copy action, QR action, and the new row in the table.

### Redirect

1. Visitor opens `/:slug`.
2. Redirect service finds the matching `ShortLink`.
3. If no link exists, show a public not-found page.
4. If the link is inactive, show a public unavailable page.
5. If the link is expired, show a public expired page.
6. If valid, redirect to `originalUrl`.
7. Analytics recording runs best-effort and must not block a successful redirect response.

### Dashboard

1. Authenticated user opens `/dashboard`.
2. App loads dashboard metrics and paginated links owned by the user.
3. User can search/filter by text, active state, and expiration state.
4. User selects a link row.
5. Insight panel shows per-link click trend, referrer, country, device, browser, recent clicks, and QR download.
6. User can create, edit, disable, delete, or copy a link without leaving the dashboard workflow.

### Landing Page

1. Visitor opens `/`.
2. Page presents the product name, concise value proposition, URL input or primary call to action, and auth links.
3. If an unauthenticated visitor enters a URL, the app routes them through registration/login.
4. After authentication, valid pending URL data can prefill the create-link form.

## UI/UX Direction

The app should feel like a compact SaaS operations tool, not a decorative marketing page.

Primary dashboard layout:

- Top bar with brand, create-link button, and user menu.
- Metric strip with total links, active links, clicks today, and top referrer.
- Main links table as the primary working surface.
- Table columns for title/original URL, short URL, clicks, status, expiration, created date, and actions.
- Search and filters above the table.
- Right-side selected-link insight panel for analytics and QR actions.
- Create/edit link in a modal or side sheet.

Responsive behavior:

- Desktop uses table plus insight panel.
- Tablet can collapse the insight panel below the table or into a drawer.
- Mobile prioritizes create action, search/filter, and a compact link list instead of a dense table.

## Error Handling

- Invalid URL: show a field-level error and do not submit.
- Unsafe or blocked URL: reject with a short explanation.
- Invalid slug: show allowed character and length requirements.
- Duplicate slug: show an error and suggest a generated alternative.
- Expired link: show a public expired page.
- Inactive link: show a public unavailable page.
- Missing link: show a public not-found page.
- Unauthorized dashboard access: redirect to login.
- Analytics write failure: log server-side and preserve redirect behavior.
- Rate limit exceeded: show a clear retry message for create actions and a generic limited response for redirect abuse.

## Testing Strategy

### Unit Tests

- URL normalization.
- URL validation.
- Slug generation and validation.
- Expiration checks.
- Device/browser/referrer parsing.
- IP hashing helper.

### Integration Tests

- User registration and login.
- Auth guard for dashboard routes/actions.
- Create link with generated slug.
- Create link with custom slug.
- Duplicate slug rejection.
- Expired and inactive redirect behavior.
- Valid redirect behavior.
- Analytics event creation best-effort behavior.

### E2E Smoke Tests

- Register or log in.
- Create a short link.
- Copy/open a short link.
- Return to dashboard and see metrics update.
- Select a link and view insight panel.
- Generate or download QR code.

### Manual Visual Verification

- Verify dashboard desktop layout.
- Verify mobile dashboard layout.
- Verify landing page, auth pages, create modal/side sheet, and public error pages.

## Future Extensions

- Custom domain support with DNS verification.
- Queue-backed analytics ingestion.
- Redis-backed rate limiting.
- OAuth login providers.
- CSV export.
- Bot filtering.
- Campaign parameter analytics.
- QR customization.
- Public API tokens.
- Admin moderation and abuse reporting.

## Open Decisions Resolved

- Product scope: account-based SaaS app.
- Stack: Next.js, Prisma, PostgreSQL.
- Auth: Auth.js/NextAuth with email/password first.
- Analytics: referrer, country, device, browser, recent clicks, and trends.
- Slugs: generated and custom slugs on the default app domain.
- Custom domains: future extension, not version one.
- Abuse protection: basic validation, blocklist, rate limiting, and disable support.
- Dashboard layout: table-first command center.
- Landing page: minimal landing page, not a full marketing site.
- Redirect analytics: best-effort async work within the redirect request path.
- Expiration: optional expiration date.
- QR: basic QR per short link with view/download.
