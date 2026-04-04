# CellTech Industrial Repair (CTIR) — Final Project Report

**Project:** actor-v4  
**Repository:** [github.com/doj-scraper/actor-v4](https://github.com/doj-scraper/actor-v4)  
**Live URL:** [actor-v4.vercel.app](https://actor-v4.vercel.app)  
**Date:** April 3, 2026  
**Status:** Frontend live, backend deployment requires env var debugging

---

## 1. Project Overview

CellTech Industrial Repair (CTIR) is a B2B wholesale mobile parts e-commerce platform built for repair shops. The platform enables bulk purchasing of OEM-grade components — displays, batteries, logic boards, camera modules — with wholesale pricing, MOQ management, and same-day dispatch.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS 3.4, shadcn/ui, Zustand |
| **Backend** | Express.js, TypeScript, Prisma ORM, Zod validation, Pino logger |
| **Database** | Neon Serverless Postgres (pooled + direct connections) |
| **Auth** | Clerk (frontend components + backend middleware via `@clerk/express`) |
| **Payments** | Stripe (checkout sessions, webhook verification) |
| **Cache** | Upstash Redis (optional, for rate limiting and session cache) |
| **Deployment** | Vercel Services (experimental) — single project, two services |

### Scale

- **58** backend TypeScript source files
- **156** frontend TypeScript/TSX files
- **52** API endpoints across 11 route modules
- **1,402** lines of route handler code
- **1,475** lines of project documentation (BACKENDREPORT, FRONTENDREPORT, ARCHITECTURE, README)

---

## 2. How It Started

The project began as two separate codebases — a fully built Express backend and a fully built Next.js frontend — each developed independently by different developers. Both were complete but had never been connected. They were uploaded to the repo as raw file dumps (`Add files via upload`) with no integration, no shared contracts, and no deployment configuration.

The backend had 52 endpoints, a full Prisma schema, Clerk/Stripe integration stubs, and comprehensive route architecture. The frontend had a complete UI with shadcn/ui components, Zustand stores, and placeholder API calls pointing to `localhost:3001`.

The challenge: wire them together, fix the bugs that surfaced, align API contracts, connect to a real database, and deploy as a unified application.

---

## 3. The Integration Process

### Phase 1: Backend Bug Fixes

The first priority was getting the backend running. Five bugs were identified and fixed:

| Bug | Issue | Fix |
|-----|-------|-----|
| **B5** | Prisma schema missing `QuoteRequest` / `QuoteRequestItem` models | Added models with proper relations |
| **B8** | Cart GET response shape didn't match frontend expectations | Aligned to spread-at-root contract |
| **B9** | Quote routes expected wrong request body shape | Fixed to match frontend form data |
| **B10** | Health endpoint didn't return JSON | Fixed response format |
| **Tailwind** | 5 shadcn components used Tailwind v4 syntax but project runs v3.4 | Rewrote all CSS classes |

### Phase 2: Database Connection

Connected to a Neon Serverless Postgres instance:
- Ran `prisma db push --force-reset` to create tables from schema
- Seeded with realistic test data via `prisma db seed`
- Verified all 52 endpoints return correct data via curl

### Phase 3: API Contract Alignment

The backend and frontend had different assumptions about response shapes. Key alignments:

- **Catalog routes** use named response keys: `{ brands: [...] }`, `{ models: [...] }`, `{ parts: [...] }`
- **Commerce routes** use `{ success: boolean, data: {...} }`
- **Cart GET** spreads data at root level (not nested under `data`)
- **Prices** are stored as integers in cents; frontend divides by 100 at display
- **`wholesalePrice === 0`** means "Contact for Price" — never display `$0.00`

### Phase 4: Frontend Wiring

With the backend stable, the frontend was wired:
- Updated `NEXT_PUBLIC_API_URL` to point to the backend
- Fixed `AddToCartButton` cents-to-dollars conversion
- Added "Contact for Price" guard for zero-price items
- Wired the quote request form to the real `/api/quotes` endpoint
- Fixed Tailwind v4→v3 CSS in `card.tsx`, `badge.tsx`, `separator.tsx`, `input.tsx`, `textarea.tsx`

### Phase 5: Auth & Payments

Added real credentials:
- Clerk: publishable key + secret key for both frontend and backend
- Stripe: secret key (backend) + publishable key (frontend)
- Verified Clerk sign-in/sign-up forms render
- Verified Stripe initializes without errors

---

## 4. Document Control — The BACKENDREPORT / FRONTENDREPORT System

A key part of this project was the **document control protocol** used to coordinate between backend and frontend developers.

### How It Worked

Two living documents sat at the repo root:

- **`BACKENDREPORT.md`** — Written by the backend developer, read by the frontend developer
- **`FRONTENDREPORT.md`** — Written by the frontend developer, read by the backend developer

### Entry Format

Every entry followed a strict format:
1. **Numbered sequentially** (Entry 1, Entry 2, ...)
2. **Dated** with timestamp
3. **Phase labeled** (Phase 1, Phase 2, etc.)
4. **Structured content** — what was done, what changed, what the other side needs to know

### What Made It Effective

- **Contract definitions lived in the reports.** Entry 1 of BACKENDREPORT established the API response shapes that the frontend would code against. The frontend dev confirmed receipt and compliance in FRONTENDREPORT Entry 3.
- **Sign-offs created accountability.** Each side explicitly acknowledged the other's entries.
- **Breaking changes were called out.** When the backend changed a response shape, it was documented before the frontend encountered it.
- **It survived developer handoffs.** When I (the backend dev) was asked to take over frontend work, the FRONTENDREPORT entries gave me full context on what had been built and what assumptions were baked in.

### Entry Count

- BACKENDREPORT: 11 entries (763 lines)
- FRONTENDREPORT: 8 entries (308 lines)

This system is recommended for any project with multiple developers working asynchronously on separate parts of a full-stack application.

---

## 5. Taking Over Frontend

Partway through integration, I was asked to take over the frontend developer's responsibilities in addition to the backend. The FRONTENDREPORT entries and the existing frontend code made this transition smooth.

### Work Done on Frontend

- Fixed 5 shadcn/ui components with Tailwind v4 → v3 syntax issues
- Corrected `AddToCartButton` price handling (cents → dollars, "Contact for Price" guard)
- Wired quote form to real backend endpoint
- Verified all API calls matched the contracts documented in BACKENDREPORT
- Ran `npm run build` to verify no TypeScript errors
- Ran `npm test` to verify API client tests pass

---

## 6. Deployment Architecture

### Vercel Services (Experimental)

The project deploys as a **single Vercel project** using the experimental Services feature. This puts both the frontend and backend under one domain with path-based routing.

```
actor-v4.vercel.app/           → Frontend (Next.js)
actor-v4.vercel.app/_/backend/ → Backend (Express)
```

### Root `vercel.json`

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

### How Routing Works

Vercel **strips the `routePrefix`** before forwarding requests to each service. A request to `/_/backend/api/health` arrives at the Express app as `/api/health`. This means the backend code needs **no changes** for the deployment — all routes at `/api/*` work as-is.

### Service-Level Config

Each service has its own `vercel.json`:

**`backend/vercel.json`** — Controls how the backend builds and serves:
```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.ts" }]
}
```

**`frontend/vercel.json`** — Standard Next.js config:
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

---

## 7. Environment Variables

### Where to Find Credentials

| Service | Source |
|---------|--------|
| **Neon Postgres** | [console.neon.tech](https://console.neon.tech) — project dashboard → Connection Details |
| **Clerk** | [dashboard.clerk.com](https://dashboard.clerk.com) — API Keys page |
| **Stripe** | [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys) |
| **Upstash Redis** | [console.upstash.com](https://console.upstash.com) — database details |

### Backend Environment Variables (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon pooled connection string | ✅ Yes |
| `DIRECT_URL` | Neon direct (non-pooled) connection string | Optional (for migrations) |
| `NODE_ENV` | `development` or `production` | Defaults to `development` |
| `JWT_SECRET` | Min 32 chars in production | ✅ Yes |
| `JWT_EXPIRES_IN` | Token expiry (e.g., `7d`) | Defaults to `7d` |
| `CORS_ORIGIN` | Frontend URL (e.g., `https://actor-v4.vercel.app`) | Defaults to `http://localhost:3000` |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Optional (auth disabled if missing) |
| `CLERK_SECRET_KEY` | Clerk secret key | Optional (auth disabled if missing) |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | Optional |
| `STRIPE_SECRET_KEY` | Stripe secret key | Optional (payments disabled if missing) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Optional |
| `REDIS_URL` | Upstash Redis connection string | Optional |

### Frontend Environment Variables (`frontend/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend URL (use `/_/backend` for Vercel Services, `http://localhost:3001` for local) | ✅ Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (same value as backend) | Optional |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Optional |
| `CLERK_SECRET_KEY` | Needed by Next.js middleware for auth route protection | Optional |

### Vercel Project Environment Variables

All 12 production env vars are currently set on the `actor-v4` Vercel project under the `crodacroda` team. To view or update:

```bash
vercel env ls production --scope crodacroda
vercel env add VARIABLE_NAME production --scope crodacroda
```

Or go to: **Vercel Dashboard → actor-v4 → Settings → Environment Variables**

---

## 8. Vercel Project Details

| Field | Value |
|-------|-------|
| **Project Name** | `actor-v4` |
| **Project ID** | `prj_XaazzS6wpAXcVS3ub0JRLA0rFpul` |
| **Team** | `crodacroda` (ID: `team_zrIgDvZoPlY3ZUuXc871BAmW`) |
| **Account** | `cecelover010101` |
| **Framework** | Services |
| **Production URL** | `actor-v4.vercel.app` |
| **Git Integration** | `doj-scraper/actor-v4` (main branch, auto-deploy) |
| **Node Version** | 24.x |

### Domains

- `actor-v4.vercel.app` (production)
- `actor-v4-crodacroda.vercel.app` (team alias)
- `actor-v4-git-main-crodacroda.vercel.app` (branch alias)

---

## 9. Known Issues & Next Steps

### Backend 500 on Vercel (Active Issue)

The backend service returns `FUNCTION_INVOCATION_FAILED` (HTTP 500) on all endpoints. The frontend renders correctly.

**Root cause:** The runtime error log says "Invalid environment variables." All 12 env vars are confirmed set via `vercel env ls`, so the issue is likely one of:
1. The `builds`/`routes` keys in `backend/vercel.json` may conflict with how Vercel Services handles Express apps — try adding `"framework": "express"` to the backend service in root `vercel.json` and simplifying `backend/vercel.json`
2. An env var format issue (quotes, whitespace) that passed `vercel env add` but fails Zod validation at runtime
3. The `@vercel/node` builder may need different configuration in Services mode

**Debugging steps:**
- Check full function logs in Vercel Dashboard → actor-v4 → Logs → filter by backend service
- Try `vercel env pull .env.production --scope crodacroda` to download and inspect the actual values
- Test with a minimal `api/index.ts` that just returns `{ ok: true }` to isolate env vs. code issues

### Clerk Auth on Production Domain

Clerk needs the production domain added to its allowed origins:
- Go to [Clerk Dashboard](https://dashboard.clerk.com) → your app → **Domains**
- Add `https://actor-v4.vercel.app` as an allowed origin
- If using a custom domain later, add that too

### Future Work

- [ ] Resolve backend FUNCTION_INVOCATION_FAILED
- [ ] Add `actor-v4.vercel.app` to Clerk allowed origins
- [ ] Set up Clerk webhook endpoint (`/api/webhooks/clerk`) for user sync
- [ ] Set up Stripe webhook endpoint (`/api/checkout/webhook`) for payment processing
- [ ] Configure a custom domain if desired
- [ ] Seed production database with real product catalog
- [ ] Set up monitoring/alerting for production errors

---

## 10. Local Development

### Prerequisites

- Node.js ≥ 18
- npm
- A Neon Postgres database (or any Postgres)

### Getting Started

```bash
git clone https://github.com/doj-scraper/actor-v4.git
cd actor-v4

# Backend
cd backend
cp .env.example .env        # Fill in your credentials
npm install
npx prisma db push           # Create tables
npx prisma db seed            # Seed test data
npm run dev                   # Starts on :3001

# Frontend (separate terminal)
cd frontend
cp .env.example .env.local   # Fill in your credentials
npm install
npm run dev                   # Starts on :3000
```

### Key Commands

| Command | Location | Purpose |
|---------|----------|---------|
| `npm run dev` | backend/ | Start dev server (tsx watch) |
| `npm run build` | backend/ | Compile TypeScript |
| `npm run dev` | frontend/ | Start Next.js dev server |
| `npm run build` | frontend/ | Production build |
| `npx prisma studio` | backend/ | Visual database browser |
| `npx prisma db seed` | backend/ | Seed test data |
| `npm test` | backend/ | Run Vitest tests |
| `npm test` | frontend/ | Run frontend tests |

---

## 11. API Endpoint Reference

All backend routes are mounted under `/api`. In production with Vercel Services, prefix with `/_/backend`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | Public | Health check + service status |
| GET | `/api/catalog/brands` | Public | List all brands |
| GET | `/api/catalog/models` | Public | List models (filter by brand) |
| GET | `/api/catalog/models/:id` | Public | Get single model |
| GET | `/api/catalog/parts` | Public | List parts (filter by model/category) |
| GET | `/api/catalog/parts/:id` | Public | Get single part |
| GET | `/api/catalog/categories` | Public | List categories |
| GET | `/api/catalog/hierarchy` | Public | Full brand→model→part tree |
| GET | `/api/catalog/search` | Public | Search parts by keyword |
| GET | `/api/inventory` | Public | List inventory (stock/pricing) |
| GET | `/api/inventory/:skuId` | Public | Get inventory for SKU |
| GET | `/api/compatibility/:partId` | Public | Get device compatibility |
| GET | `/api/cart` | Optional | Get cart contents |
| POST | `/api/cart/items` | Optional | Add item to cart |
| PUT | `/api/cart/items/:id` | Optional | Update cart item quantity |
| DELETE | `/api/cart/items/:id` | Optional | Remove cart item |
| DELETE | `/api/cart` | Optional | Clear entire cart |
| POST | `/api/quotes` | Optional | Submit quote request |
| GET | `/api/quotes` | Required | List user's quotes |
| GET | `/api/quotes/:id` | Required | Get quote detail |
| POST | `/api/checkout/session` | Required | Create Stripe checkout session |
| GET | `/api/orders` | Required | List user's orders |
| GET | `/api/orders/:id` | Required | Get order detail |
| POST | `/api/webhooks/clerk` | Webhook | Clerk user sync |
| POST | `/api/checkout/webhook` | Webhook | Stripe payment webhook |
| GET | `/api/users/profile` | Required | Get current user profile |
| PUT | `/api/users/profile` | Required | Update user profile |
| GET | `/api/monitoring/metrics` | Admin | Server metrics |

*(52 total including sub-routes, filters, and pagination variants)*

---

## 12. File Structure

```
actor-v4/
├── vercel.json                    # Root Services config
├── README.md                      # Project overview
├── ARCHITECTURE.md                # System diagrams & schemas
├── BACKENDREPORT.md               # Backend dev log (11 entries)
├── FRONTENDREPORT.md              # Frontend dev log (8 entries)
├── DEPLOYCONFIGINSTRUCT.md        # Vercel Services setup guide
├── FINALREPORT.md                 # This document
│
├── backend/
│   ├── vercel.json                # Backend service config
│   ├── package.json               # Dependencies & scripts
│   ├── tsconfig.json              # TypeScript config
│   ├── .env.example               # Env var template
│   ├── api/
│   │   └── index.ts               # Vercel serverless entry point
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Test data seeder
│   └── src/
│       ├── index.ts               # Local dev entry (app.listen)
│       ├── app.ts                 # Express app factory
│       ├── config/                # env.ts, cors.ts
│       ├── middleware/            # auth, errors, metrics
│       ├── routes/                # 11 route modules
│       ├── lib/                   # prisma, logger, clerk, stripe
│       └── types/                 # TypeScript type definitions
│
└── frontend/
    ├── vercel.json                # Frontend service config
    ├── package.json               # Dependencies & scripts
    ├── next.config.ts             # Next.js configuration
    ├── tailwind.config.cjs        # Tailwind v3 config (.cjs for ESM compat)
    ├── .env.example               # Env var template
    ├── app/                       # Next.js App Router pages
    ├── components/                # React components (shadcn/ui based)
    ├── lib/                       # API client, utilities
    ├── store/                     # Zustand stores (cart, auth)
    └── hooks/                     # Custom React hooks
```

---

## 13. Commit History

| Hash | Message | Author | Date |
|------|---------|--------|------|
| `5b31780` | chore: add deployer agent, update gitignore | Rovo Dev | 2026-04-03 |
| `6c493f4` | deploy: add root vercel.json for Vercel Services | Rovo Dev | 2026-04-03 |
| `c50c57f` | docs: Entry 11 Vercel deployment prep, clean env examples | Rovo Dev | 2026-04-03 |
| `46ae963` | Create DEPLOYCONFIGINSTRUCT.md | cece | 2026-04-03 |
| `bf994ec` | docs: add README.md, ARCHITECTURE.md, update BACKENDREPORT Entry 10 | Rovo Dev | 2026-04-03 |
| `af5ff72` | fix: remove old tailwind.config.js (renamed to .cjs) | Rovo Dev | 2026-04-03 |
| `e9ef06b` | fix: rename tailwind.config.js → .cjs to silence ESM/CJS warning | Rovo Dev | 2026-04-03 |
| `2f8580c` | feat: full-stack integration — backend + frontend wired and ready | Rovo Dev | 2026-04-03 |
| `ebbe19d` | Add files via upload | cece | 2026-04-03 |

---

## 14. Lessons Learned

1. **Document control works.** The BACKENDREPORT/FRONTENDREPORT system gave both developers a shared source of truth. When the backend changed an API shape, the frontend knew before hitting a runtime error.

2. **API contracts should be defined early and explicitly.** The biggest integration friction came from undocumented assumptions — cart response shapes, price units (cents vs. dollars), what `wholesalePrice === 0` means.

3. **Tailwind version mismatches are silent killers.** The project used Tailwind v3.4 but some components had v4 syntax. No build error, no warning — just broken styles at runtime.

4. **`"type": "module"` in package.json affects config files.** The `tailwind.config.js` had to be renamed to `.cjs` because it uses `module.exports` but the package is ESM.

5. **Vercel Services is powerful but experimental.** Deploying a monorepo as a single Vercel project simplifies infrastructure, but debugging is harder because error messages are less mature.

6. **Never put secrets in markdown.** GitHub's secret scanning blocked our push when BACKENDREPORT.md contained actual API keys in a reference table. Always use descriptions/placeholders in committed docs.

7. **Clerk needs BOTH keys.** `clerkMiddleware()` in Express requires both `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Missing the publishable key causes a 500 error, not a helpful message.

---

*This report was generated as part of the actor-v4 integration project. For questions, refer to the BACKENDREPORT.md and FRONTENDREPORT.md for detailed chronological context of every decision made during development.*
