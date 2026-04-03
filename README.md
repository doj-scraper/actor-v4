# CellTech Distributor

B2B wholesale mobile parts platform — browse device-specific parts, manage inventory, request quotes, and place wholesale orders.

## Quick Start

```bash
# 1. Clone
git clone https://github.com/doj-scraper/actor-v4.git
cd actor-v4

# 2. Backend
cd backend
cp .env.example .env          # fill in real credentials
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev                    # → http://localhost:3001

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local     # fill in real credentials
npm install
npm run dev                    # → http://localhost:3000
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Zustand, Tailwind CSS 3.4 |
| Backend | Express.js, TypeScript, Zod validation, Pino logging |
| Database | PostgreSQL (Neon serverless) via Prisma ORM |
| Auth | Clerk (OAuth + email) with guest-to-account merge |
| Payments | Stripe (test mode) |
| Cache | Redis / Upstash (optional — in-memory LRU fallback) |
| Hosting | Vercel (serverless functions + edge) |

## Project Structure

```
actor-v4/
├── backend/
│   ├── api/index.ts            # Vercel serverless entry point
│   ├── prisma/
│   │   ├── schema.prisma       # 16 models, Neon adapter
│   │   └── seed.ts             # Brands, models, variants, 9 SKUs
│   └── src/
│       ├── app.ts              # Express app factory (11 route modules)
│       ├── routes/             # 52 API endpoints
│       ├── services/           # Business logic layer
│       ├── middleware/         # Auth, validation, rate limiting, errors
│       └── lib/               # Prisma, Redis, Stripe, Clerk clients
├── frontend/
│   ├── app/                    # 15 pages (Next.js App Router)
│   ├── components/             # 96 components (Radix + shadcn/ui)
│   ├── store/                  # 5 Zustand stores
│   ├── hooks/                  # useAuth, useCart, useApp
│   └── lib/                    # API client, Clerk-safe wrappers
├── BACKENDREPORT.md            # Integration progress log
├── FRONTENDREPORT.md           # Frontend progress log
└── ARCHITECTURE.md             # Technical architecture details
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL pooled connection string |
| `DIRECT_URL` | ✅ | Neon direct connection (for migrations) |
| `PORT` | — | Server port (default: 3001) |
| `CORS_ORIGIN` | — | Frontend URL (default: http://localhost:3000) |
| `CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | — | Clerk webhook signing secret |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | — | Stripe webhook signing secret |
| `REDIS_URL` | — | Redis/Upstash URL (falls back to in-memory LRU) |
| `JWT_SECRET` | — | Legacy JWT fallback (default: dev key) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend URL (default: http://localhost:3001) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key |

## API Endpoints

**52 endpoints** across 11 route modules, all under `/api/`:

| Module | Routes | Auth | Description |
|--------|--------|------|-------------|
| Health | 2 | Public | Liveness probe, detailed health check |
| Catalog | 6 | Public | Brands, models, hierarchy, parts search |
| Inventory | 7 | Public | SKU details, specs, stock, bulk ops |
| Compatibility | 1 | Public | Part-to-device mapping |
| Cart | 11 | Required | Add, update, remove, sync, validate |
| Checkout | 3 | Required | Payment intents, guest checkout |
| Orders | 4 | Required | Order history, details, status |
| Quote | 2 | Optional | RFQ creation and retrieval |
| Users | 2 | Required | Profile get/update |
| Webhooks | 1 | Signed | Clerk user sync events |
| Monitoring | 13 | Admin | Events, metrics, alerts, health snapshots |

## Key Conventions

- **Prices in cents** — all prices stored as integers. `wholesalePrice === 0` means "Contact for Price" (never display $0.00). Frontend divides by 100 at display time.
- **Smart SKU format** — `[Bucket]-[Subcategory]-[Grade]-[Device]` (e.g., `2-C-O-IP13`)
- **MOQ** — minimum order quantity is 5 units, enforced client and server
- **API response patterns** — Catalog routes use named keys (`brands`, `models`, `hierarchy`). Commerce routes use `{ success, data }`. Cart GET spreads at root level.
- **Auth graceful degradation** — app works without Clerk/Stripe keys configured
- **Design tokens** — `ct-bg` (#070A12), `ct-accent` (#00E5C0), `ct-text` (#F2F5FA)

## Scripts

### Backend
```bash
npm run dev          # Development server (tsx watch)
npm run build        # TypeScript compile
npm run test         # Run tests (vitest)
npm run lint         # ESLint
npx prisma studio    # Database GUI
npx prisma db seed   # Seed sample data
```

### Frontend
```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run test         # Run tests (vitest)
npm run lint         # Next.js lint
```

## Deployment

Both projects deploy to **Vercel** as separate projects:

- **Backend** → Serverless function via `api/index.ts` (project: `ctir-backendv1-official`)
- **Frontend** → Standard Next.js deployment

Set the environment variables listed above in each Vercel project's settings. The backend's `CORS_ORIGIN` should point to the frontend's production URL, and the frontend's `NEXT_PUBLIC_API_URL` should point to the backend's production URL.

## License

Private — all rights reserved.
