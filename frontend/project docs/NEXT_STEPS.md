# NEXT_STEPS — CellTech Monorepo

---

## 2025-03-25: Backend Build-Out Complete — Next Steps

### ✅ Completed Today (Backend)

1. **Prisma Schema Migration** — 4-level hierarchy (Brand → ModelType → Generation → Variant), strict nullable fixes, Specification table, CompatibilityMap composite PK, Category model, QuoteRequest model.
2. **Clerk Auth Integration** — Replaced NextAuth/JWT with `@clerk/express` middleware. `req.auth` hydrated from Clerk, `req.user` from local DB via `clerkId`. Legacy `auth.routes.ts`, `auth.service.ts`, and `auth.routes.test.ts` removed.
3. **Clerk Webhook Endpoint** — `POST /api/webhooks/clerk` handles `user.created`, `user.updated`, `user.deleted` events via Svix signature verification.
4. **Catalog API** — `GET /api/hierarchy` (full 4-level device tree), `GET /api/variants/:variantId/parts` (variant-specific parts lookup).
5. **Commerce API** — Full Cart CRUD (`GET/POST/PATCH/DELETE /api/cart`, `/api/cart/validate`, `/api/cart/sync`), Checkout (`POST /api/checkout`, Stripe webhook), Orders (`GET /api/orders`, `GET /api/orders/:id`), Quote Requests (`POST /api/quote`).
6. **User Profile** — `GET/PUT /api/users/profile` (Clerk-authenticated).
7. **Build Verification** — TypeScript compiles clean (`tsc --noEmit`), 63 tests pass, 12 test files green.

### 🔜 Immediate Next Steps

#### Priority 1: Environment & Deployment
- [ ] Drop in Clerk environment variables (`CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`) to `celltech-backend/.env`
- [ ] Verify Stripe keys are set (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- [ ] Run `npx prisma migrate deploy` against production database
- [ ] Run `npx prisma db seed` to populate hierarchy + inventory data
- [ ] Deploy backend to Vercel and verify `/api/health` endpoint

#### Priority 2: Frontend ↔ Backend Integration
- [ ] Update `celltech-frontend/lib/api.ts` to consume new endpoints:
  - `/api/hierarchy` for Device Explorer 4-level tree
  - `/api/variants/:variantId/parts` for variant-specific parts
  - `/api/cart/*` for server-side cart management
  - `/api/checkout` for Stripe checkout flow
  - `/api/orders` for order history
- [ ] Install `@clerk/nextjs` in frontend and configure Clerk provider
- [ ] Replace mock cart data with live `/api/cart` calls
- [ ] Replace mock device hierarchy with `/api/hierarchy` calls
- [ ] Wire up checkout UI to `POST /api/checkout` → Stripe Elements

#### Priority 3: Clerk Webhook Configuration
- [ ] Set up Clerk webhook endpoint in Clerk Dashboard pointing to `{BACKEND_URL}/api/webhooks/clerk`
- [ ] Enable `user.created`, `user.updated`, `user.deleted` events
- [ ] Copy the signing secret to `CLERK_WEBHOOK_SECRET` in `.env`

#### Priority 4: Testing & Hardening
- [ ] Write integration tests for the Clerk webhook endpoint
- [ ] Add end-to-end cart → checkout → order flow test
- [ ] Test Stripe webhook handling (payment success, failure, cancellation)
- [ ] Load test inventory endpoints with production-scale data
- [ ] Implement rate limiting configuration for production

#### Priority 5: Admin & Operational
- [ ] Build admin dashboard endpoints (ADMIN role gating)
- [ ] Add inventory management endpoints (create/update/delete SKUs)
- [ ] Implement order status update endpoints (SHIPPED, DELIVERED, etc.)
- [ ] Add search/filter endpoints for inventory (by category, quality grade, price range)

---

## 2025-03-26: System Health Dashboard — In Progress

### 🔨 Currently Building
- [ ] `GET /api/health/detailed` — Backend health service with latency checks for PostgreSQL, Redis, Clerk, Stripe
- [ ] System Health Dashboard UI — Admin page at `/admin/health` with RED/YELLOW/GREEN status lights
- [ ] Health endpoint tests — Vitest coverage for detailed health check

### 📋 Remaining After Health Dashboard
- [ ] Frontend ↔ Backend integration (see Priority 2 above)
- [ ] Clerk webhook configuration in Clerk Dashboard
- [ ] Database migration on production
- [ ] Admin endpoints (inventory CRUD, order status management)
- [ ] Search/filter endpoints for inventory
