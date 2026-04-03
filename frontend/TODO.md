# CellTech Distributor — Migration TODO

> **Created:** 2026-04-02 · **Branch:** copilot/research-3-phase-migration
>
> Three-phase migration plan derived from codebase research. All file paths are relative to the
> project root (`ctir-fe-ofc-v1/`). Backend paths refer to the separate `celltech-backend/` repo.

---

## Phase 1 — Migrate Clerk → Supabase Auth

### 1.1 Remove Clerk

- [ ] Remove `@clerk/nextjs` from `package.json` dependencies
- [ ] Add `@supabase/supabase-js` and `@supabase/ssr` to `package.json` dependencies

### 1.2 Create Supabase Client Utilities

- [ ] Create `lib/supabase/client.ts` — browser-side client using `createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`
- [ ] Create `lib/supabase/server.ts` — server-side client using `createServerClient` (reads cookies from Next.js headers)
- [ ] Create `lib/supabase/middleware.ts` — middleware client helper for session refresh

### 1.3 Replace Auth Provider

- [ ] Rewrite `components/auth-provider.tsx`
  - Remove `ClerkProvider` import from `@clerk/nextjs`
  - Replace with a Supabase `SessionContextProvider` (or context built on `supabase.auth.onAuthStateChange`)
  - Preserve the fallback `<>{children}</>` pattern when env vars are absent

### 1.4 Replace Safe Auth Hooks

- [ ] Delete `lib/clerk-safe.ts` (currently exports `useSafeClerkAuth` and `useSafeClerkUser`)
- [ ] Create `lib/supabase-auth.ts` with equivalent safe wrappers:
  - `useSafeSupabaseSession()` → returns `{ session, user }` or noop fallback
  - `getAccessToken()` → returns `session.access_token` (replaces `getToken()`)

### 1.5 Update `hooks/useAuth.ts`

- [ ] Replace `useSafeClerkUser()` / `useSafeClerkAuth()` calls with Supabase equivalents
- [ ] Replace `clerkUser.id`, `clerkUser.primaryEmailAddress`, `clerkUser.fullName` with `user.id`, `user.email`, `user.user_metadata.full_name`
- [ ] Replace `getToken()` with `session.access_token` passed directly to `fetchUserProfile()`

### 1.6 Update Auth Store

- [ ] In `store/authStore.ts`, rename `clerkId: string` → `supabaseId: string` in the `User` interface
- [ ] Update the JSDoc comment (currently says "powered by Clerk")

### 1.7 Update API Client

- [ ] In `lib/api.ts` line 403, rename `clerkId: string | null` → `supabaseId: string | null` in `UserProfile` interface

### 1.8 Replace Middleware

- [ ] Rewrite `middleware.ts`:
  - Remove `clerkMiddleware` / `createRouteMatcher` dynamic import from `@clerk/nextjs/server`
  - Remove `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` guard
  - Use Supabase SSR `createMiddlewareClient` to refresh the session cookie on every request
  - Protect `/dashboard(.*)` and `/admin(.*)` by checking `session` and redirecting to `/sign-in` if absent
  - Keep the existing `config.matcher` regex unchanged

### 1.9 Update Components that Call `useSafeClerkAuth`

- [ ] `components/dashboard-section.tsx` (lines 5, 62) — replace `useSafeClerkAuth` / `getToken` with Supabase `session.access_token`
- [ ] `components/checkout-section.tsx` (lines 6, 42) — same replacement
- [ ] `app/admin/health/page.tsx` (lines 4, 107, 117) — same replacement

### 1.10 Create Auth Pages

- [ ] Create `app/sign-in/page.tsx` — Supabase email/password sign-in using `components/forms/FormInput` and `.btn-primary` styling; dark `ct-bg` theme; no Nav/Footer (already in `app/layout.tsx`)
- [ ] Create `app/sign-up/page.tsx` — Supabase registration form using existing form components and `components/forms/PasswordStrength.tsx`

### 1.11 Update Environment Variables

- [ ] Update `.env.example`:
  - Remove `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
  - Add `NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co`
  - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`
  - Add `SUPABASE_SERVICE_ROLE_KEY=eyJ...` (server-only, if needed for admin operations)

### 1.12 Backend Coordination (celltech-backend/)

- [ ] Replace `@clerk/express` middleware with Supabase JWT verification (verify `Authorization: Bearer <access_token>` using `SUPABASE_JWT_SECRET`)
- [ ] Replace `POST /api/webhooks/clerk` (Svix-verified) with a **Supabase Auth webhook** (`user.created`, `user.updated`, `user.deleted`) to keep the `User` table in Postgres in sync
- [ ] Update backend `User` model: rename `clerkId` → `supabaseId` in `prisma/schema.prisma`
- [ ] Run `npx prisma migrate dev --name clerk-to-supabase` on the backend

---

## Phase 2 — Stripe Managed via Supabase

### 2.1 Add Stripe Dependencies (Frontend)

- [ ] Add `@stripe/stripe-js` and `@stripe/react-stripe-js` to `package.json` dependencies

### 2.2 Create Stripe Client Utility

- [ ] Create `lib/stripe/client.ts` — calls `loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)` and exports the promise

### 2.3 Update Checkout Section

- [ ] In `components/checkout-section.tsx`, consume `result.stripeClientSecret` returned by `createCheckout()` (`lib/api.ts:324`)
- [ ] Wrap the payment confirmation step with `<Elements stripe={stripePromise} options={{ clientSecret }}>` from `@stripe/react-stripe-js`
- [ ] Add a `<PaymentElement />` step before the success redirect
- [ ] Confirm the payment with `stripe.confirmPayment()` on submit; only redirect to `/checkout/success` on success

### 2.4 Link Supabase User ID to Stripe Customer

- [ ] On the backend: when handling `POST /api/checkout`, look up or create a Stripe customer using the Supabase `user.id` (stored as `supabaseId` in the `User` table)
- [ ] Store `stripeCustomerId` on the backend `User` model (additive migration)
- [ ] Frontend `lib/api.ts` needs no change — the backend handles the Stripe ↔ user linkage

### 2.5 Update Environment Variables

- [ ] Add to `.env.example`: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- [ ] Backend `.env`: `STRIPE_SECRET_KEY=sk_...` and `STRIPE_WEBHOOK_SECRET=whsec_...` (already documented)

---

## Phase 3 — Supabase PostgreSQL (Prisma / Seed)

> **Note:** The frontend has no direct database connection. All DB access is through the Express
> backend. The items below are backend tasks documented here for cross-reference.

### 3.1 Schema Migration (celltech-backend/prisma/schema.prisma)

- [ ] Add `supabaseId String? @unique` to `User` model (rename from `clerkId`)
- [ ] Add `stripeCustomerId String? @unique` to `User` model
- [ ] Verify all nullable-field fixes are applied: `wholesalePrice @default(0)`, `partName String` (required), `qualityGrade` required enum, `marketingName` required
- [ ] Confirm 4-level device hierarchy is in place: `Brand → ModelType → Generation → Variant`
- [ ] Confirm `Specification` table (normalized `skuId, label, value`) is in place
- [ ] Confirm `CompatibilityMap` uses composite PK `@@id([skuId, variantId])`
- [ ] Run `npx prisma migrate dev` and verify migration applies cleanly

### 3.2 Seed Script (celltech-backend/prisma/seed.ts)

- [ ] Verify seed is idempotent (`upsert` throughout — no duplicate-key errors on re-run)
- [ ] Confirm seed covers: 2+ brands, 4 categories, real Smart SKUs, specs rows, compatibility maps
- [ ] Add a `seed:ci` script with a minimal fixture set (2 brands, 1 category, 3 SKUs) for fast CI runs

### 3.3 Frontend DB Connection (None Required)

- [ ] No `DATABASE_URL`, Prisma client, or direct Supabase DB queries needed in the frontend
- [ ] All data goes through `NEXT_PUBLIC_API_URL` → Express → Prisma → Neon PostgreSQL

---

## General Requirements

### Middleware — Upstash Redis Rate Limiting

> Rate limiting is primarily a **backend concern** (see `DOCS/BACKEND_ROADMAP.md` Stage C-11).
> The following is optional frontend edge-level rate limiting.

- [ ] (Optional) Add `@upstash/redis` and `@upstash/ratelimit` to `package.json`
- [ ] (Optional) In `middleware.ts`, after session refresh, add a `Ratelimit.slidingWindow` check against the client IP before the route-protection guard
- [ ] Add to `.env.example` if used: `UPSTASH_REDIS_REST_URL=https://...` and `UPSTASH_REDIS_REST_TOKEN=...`

### Complete Frontend `.env.example` (Target State)

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://ctir-backendv1-official.vercel.app

# Supabase Auth (replaces Clerk)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-only, omit if not doing server-side admin queries

# Stripe (Phase 2)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Upstash Redis (optional — edge rate limiting in middleware.ts)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### UI Design Alignment (DOCS/UI.md)

- [ ] All new auth pages (`/sign-in`, `/sign-up`) must use dark `ct-bg` (`#070A12`) backgrounds
- [ ] Use `.btn-primary` / `.btn-secondary` for CTA buttons
- [ ] Use `.input-dark` for all form inputs (defined in `app/globals.css`)
- [ ] Use `font-display` (Sora) for headings, `font-body` (Inter) for form labels/inputs
- [ ] Reuse `components/forms/FormInput.tsx`, `PasswordStrength.tsx`, `AddressForm.tsx` — already correctly styled
- [ ] Follow `pt-16` on page content to clear the fixed nav

---

## File Impact Summary

| File | Phase | Action |
|---|---|---|
| `middleware.ts` | 1 + Upstash | Rewrite — Supabase SSR session refresh + optional rate limit |
| `components/auth-provider.tsx` | 1 | Rewrite — replace `ClerkProvider` with Supabase context |
| `lib/clerk-safe.ts` | 1 | **Delete** |
| `lib/supabase/client.ts` | 1 | **Create** |
| `lib/supabase/server.ts` | 1 | **Create** |
| `lib/supabase/middleware.ts` | 1 | **Create** |
| `lib/supabase-auth.ts` | 1 | **Create** — replaces `lib/clerk-safe.ts` |
| `hooks/useAuth.ts` | 1 | Update — replace Clerk hooks with Supabase session |
| `store/authStore.ts` | 1 | Update — rename `clerkId` → `supabaseId` |
| `lib/api.ts` (line 403) | 1 | Update — rename `clerkId` → `supabaseId` in `UserProfile` |
| `components/dashboard-section.tsx` | 1 | Update — replace `useSafeClerkAuth` |
| `components/checkout-section.tsx` | 1 + 2 | Update — replace `useSafeClerkAuth`; add Stripe Elements |
| `app/admin/health/page.tsx` | 1 | Update — replace `useSafeClerkAuth` |
| `app/sign-in/page.tsx` | 1 | **Create** |
| `app/sign-up/page.tsx` | 1 | **Create** |
| `lib/stripe/client.ts` | 2 | **Create** — `loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)` |
| `.env.example` | 1 + 2 | Update — swap Clerk keys for Supabase + Stripe |
| `package.json` | 1 + 2 | Update — remove `@clerk/nextjs`; add Supabase + Stripe packages |
| `prisma/schema.prisma` _(backend)_ | 3 | Update — `supabaseId`, `stripeCustomerId`, verify hierarchy |
| `prisma/seed.ts` _(backend)_ | 3 | Verify idempotency; add `seed:ci` script |

---

*Plan saved 2026-04-02. Reference: branch `copilot/research-3-phase-migration`.*
