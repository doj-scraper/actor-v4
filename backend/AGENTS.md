# AGENTS.md — AI Agent Guidelines for CellTech Backend

This document provides context and rules for AI coding agents (Rovo Dev, GitHub Copilot, etc.) working in this repository.

---

## 🧠 Memory — Current State (Updated 2026-04-04)

### Where We Are
- **Monorepo:** This backend lives at `backend/` inside the `actor-v4` monorepo (repo: `doj-scraper/actor-v4`)
- **Database connected:** Neon PostgreSQL — tables created (`prisma db push`), seeded (`prisma db seed`)
- **All 52 endpoints verified** locally via curl — every route returns correct data
- **Clerk + Stripe configured** locally — keys in `backend/.env` and `frontend/.env.local`
- **Clerk middleware is conditional** — skips when `CLERK_SECRET_KEY` is not set (see `src/middleware/auth.ts`)
- **Frontend integration complete** — API contracts aligned, prices in cents, response shapes confirmed
- **Deployed to Vercel Services** (experimental) — single project, frontend works, **backend has a runtime issue** (see DEBUGNOTES.md)

### Deployment Architecture
The project uses **Vercel's experimental Services** feature. Both frontend and backend deploy as a single Vercel project under one domain.

**Live URL:** `actor-v4.vercel.app`
- Frontend: `actor-v4.vercel.app/` → Next.js (working ✅)
- Backend: `actor-v4.vercel.app/_/backend/` → Express (runtime error ❌)

**Root `vercel.json`** (at repo root, NOT in backend/):
```json
{
  "experimentalServices": {
    "frontend": {
      "entrypoint": "frontend",
      "routePrefix": "/",
      "framework": "nextjs"
    },
    "backend": {
      "entrypoint": "backend",
      "routePrefix": "/_/backend"
    }
  }
}
```

**How routing works:** Vercel **strips the routePrefix** before forwarding. A request to `/_/backend/api/health` arrives at Express as `/api/health`. Backend code does NOT need the prefix in route definitions.

**Backend `vercel.json`** (at `backend/vercel.json`):
```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.ts" }]
}
```

**Known issue:** Backend returns `FUNCTION_INVOCATION_FAILED` at runtime. Build succeeds. Env vars are set on the Vercel project but may not be reaching the serverless function. See `DEBUGNOTES.md` at repo root for full debugging history and suggested fixes.

### Vercel Project Details
| Field | Value |
|-------|-------|
| Project Name | `actor-v4` |
| Project ID | `prj_XaazzS6wpAXcVS3ub0JRLA0rFpul` |
| Team | `crodacroda` (`team_zrIgDvZoPlY3ZUuXc871BAmW`) |
| Account | `cecelover010101` |
| Framework | Services |
| Git repo | `doj-scraper/actor-v4` (auto-deploy on push to main) |

### Environment Variables on Vercel (Production)
All 12 set via `vercel env add ... production --scope crodacroda`:

| Variable | Set? |
|----------|------|
| `DATABASE_URL` | ✅ |
| `DIRECT_URL` | ✅ |
| `NODE_ENV` | ✅ (production) |
| `JWT_SECRET` | ✅ |
| `JWT_EXPIRES_IN` | ✅ |
| `CORS_ORIGIN` | ✅ (https://actor-v4.vercel.app) |
| `CLERK_PUBLISHABLE_KEY` | ✅ |
| `CLERK_SECRET_KEY` | ✅ |
| `STRIPE_SECRET_KEY` | ✅ |
| `NEXT_PUBLIC_API_URL` | ✅ (/_/backend) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ |

### API Contracts (Permanent)
- **Catalog routes** use named response keys: `{ brands: [...] }`, `{ models: [...] }`, `{ parts: [...] }`, `{ hierarchy: [...] }`
- **Commerce routes** use `{ success: boolean, data: {...} }`
- **Cart GET** spreads data at root level (not nested under `data`)
- **Prices** are `Int` in cents — frontend divides by 100 at display
- **`wholesalePrice === 0`** means "Contact for Price" — never display $0.00

### Documentation
| File | Location | Purpose |
|------|----------|---------|
| `BACKENDREPORT.md` | repo root | 11 entries — full backend dev log |
| `FRONTENDREPORT.md` | repo root | 8 entries — full frontend dev log |
| `FINALREPORT.md` | repo root | Complete project case study |
| `DEBUGNOTES.md` | repo root | Vercel backend 500 debugging notes |
| `ARCHITECTURE.md` | repo root | System diagrams, DB schema, auth flow |
| `README.md` | repo root | Project overview and quickstart |
| `DEPLOYCONFIGINSTRUCT.md` | repo root | Vercel Services setup instructions |

### What To Do Next
1. **Fix backend FUNCTION_INVOCATION_FAILED** — see DEBUGNOTES.md for theories and suggested fixes
2. **Add `actor-v4.vercel.app` to Clerk allowed origins** — required for auth on production domain
3. **Set up Clerk webhook** pointing to `https://actor-v4.vercel.app/_/backend/api/webhooks/clerk`
4. **Set up Stripe webhook** pointing to `https://actor-v4.vercel.app/_/backend/api/checkout/webhook`
5. **Seed production database** with real product catalog (currently has test data)

---

## Repository Purpose

This is the **CellTech wholesale parts distribution backend**. It is a production Express.js REST API deployed on Vercel, backed by Neon PostgreSQL and Upstash Redis. Authentication is handled entirely by **Clerk** — there are no passwords, sessions, or NextAuth artifacts in this codebase.

---

## Critical Conventions — Read Before Making Changes

### 1. Prices are Always Cents (Int)

**Never use `Float` for monetary values.** All prices (`wholesalePrice`, `unitPriceAtPurchase`, `totalCents`) are stored as `Int` in the database representing **cents**.

- `wholesalePrice = 0` means **"Contact for Price"** — never render `$0.00`.
- Divide by 100 only at the presentation layer (frontend).

### 2. `skuId` is the Inventory Primary Key

The `Inventory` model uses `skuId String @id` — the Smart SKU string IS the primary key. There is no separate `id` column on `Inventory`. Queries must use `where: { skuId: "..." }`.

### 3. Smart SKU Format

```
[Bucket]-[Subcategory]-[Grade]-[Device]
Example: 3-B-O-IP13 (Battery / OEM / iPhone 13)
```

This is a string identifier only — the backend does not parse or validate the format segments at runtime.

### 4. Clerk Auth — `clerkId` is Nullable

`User.clerkId` is `String? @unique` — it is **nullable** for guest users. Do not assume `clerkId` is always set. Use `where: { clerkId }` only when you know the user is a registered Clerk user.

### 5. Guest Identity Flow

```
Guest checkout → generateGuestId() → userid-g00042
  → User created with isGuest: true, clerkId: null
  → Later: Clerk webhook user.created → merge by email → clerkId set, isGuest: false
```

The merge logic lives in `src/routes/webhooks.routes.ts`. Never create a duplicate user — always check by email first.

### 6. Response Shape

Every route returns this envelope:

```typescript
{ success: boolean, data?: T, error?: string, meta?: PaginationMeta }
```

Use `next(error)` for error propagation — never `res.status(500).send(...)` directly from a route handler (except in the error handler itself).

### 7. Field Names — Use These Exactly

| ❌ Old (do not use) | ✅ Current |
|---|---|
| `unitPrice` / `price` | `wholesalePrice` (Int, cents) |
| `quantity` (on Inventory) | `stockLevel` |
| `pricePerUnit` | `unitPriceAtPurchase` (Int, cents) |
| `totalPrice` | `totalCents` (Int, cents) |
| `inventoryId` (FK) | `skuId` (FK — points to `Inventory.skuId`) |
| `key` (on Specification) | `label` |
| `externalId` | `clerkId` |

---

## Architecture Boundaries

| Layer | Rule |
|---|---|
| **Routes** | Validation (Zod) → call service → return response. No business logic here. |
| **Services** | All business logic lives here. Services call Prisma, Redis, Stripe, Clerk. |
| **Middleware** | Auth, error handling, rate limiting, metrics only. |
| **Lib** | Singleton clients (Prisma, Redis, Stripe, Clerk, Logger). No business logic. |

---

## What NOT to Do

- ❌ Do not add `password`, `passwordHash`, `Account`, or `Session` models — Clerk handles all of this.
- ❌ Do not add a surrogate `id` column to `Inventory` — `skuId` is the PK.
- ❌ Do not use `Float` for prices — use `Int` (cents).
- ❌ Do not use `variantId` as a direct FK on `Inventory` — use `CompatibilityMap`.
- ❌ Do not render `$0.00` — treat `wholesalePrice === 0` as "Contact for Price".
- ❌ Do not skip the Svix signature check on Clerk webhooks.
- ❌ Do not skip the Stripe signature check on Stripe webhooks.
- ❌ Do not call `prisma.$disconnect()` in route handlers — the singleton manages the connection.

---

## Adding a New Route

1. Create `src/routes/my-feature.routes.ts` — thin handler, Zod validation, call service.
2. Create `src/services/my-feature.service.ts` — business logic class.
3. Mount in `src/app.ts`: `app.use('/api/my-feature', myFeatureRoutes)`.
4. Add the route to `README.md` API reference table.
5. Add a test in `src/__tests__/my-feature.routes.test.ts`.

## Adding a New Schema Model

1. Edit `prisma/schema.prisma`.
2. Run `npm run prisma:migrate` to generate a migration file.
3. Run `npm run prisma:generate` to regenerate the Prisma client.
4. Update `ARCHITECTURE.md` if the model is significant.
5. Update `prisma/seed.ts` if sample data is needed.

---

## Testing

Tests live in `src/__tests__/` and use **Vitest**. Mock Prisma and external services — never call real external APIs in tests.

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## Environment Variables

All env vars are validated at startup via Zod in `src/config/env.ts`. If a required variable is missing, the server **will not start**. Add new env vars there first, then to `.env.example`.
