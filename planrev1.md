# Backend / Frontend Integration Plan v1

> Source of truth for this revision: `integration-checklist.md`, current `backend/` and `frontend/` repo structure, plus the existing backend/frontend agent notes.
>
> Important: this plan is for **integration**, not a product rewrite. The backend and frontend already exist and are functional. The work is to make the contract explicit, keep the dev servers running, and verify the two apps work together end-to-end.

## 1. What This Plan Is Asking For

- Prove the frontend can reliably talk to the backend through the actual API contract used in this repo.
- Keep the backend and frontend as separate boundaries.
- Start with the smallest possible proof: `GET /api/health`.
- Move in layers:
  - transport and CORS
  - auth/session propagation
  - read-only catalog/inventory data
  - cart / quote / checkout
  - orders / dashboard / admin / monitoring
- Keep the dev servers up while integrating so regressions are visible immediately.
- Prefer incremental verification over large merges.

## 2. What This Plan Is Not Asking For

- It is not asking for a new architecture.
- It is not asking to replace Clerk with another auth provider as part of integration.
- It is not asking to rewrite Prisma models unless a contract mismatch blocks integration.
- It is not asking to move backend logic into the frontend or vice versa.
- It is not asking to invent new routes when existing ones already cover the needed flow.

## 3. Repo Reality

### Backend

- Express app factory: `backend/src/app.ts`
- Server bootstrap: `backend/src/index.ts`
- Env validation: `backend/src/config/env.ts`
- CORS: `backend/src/config/cors.ts`
- Current route surface:
  - `backend/src/routes/health.routes.ts`
  - `backend/src/routes/catalog.routes.ts`
  - `backend/src/routes/inventory.routes.ts`
  - `backend/src/routes/compatibility.routes.ts`
  - `backend/src/routes/cart.routes.ts`
  - `backend/src/routes/checkout.routes.ts`
  - `backend/src/routes/orders.routes.ts`
  - `backend/src/routes/quote.routes.ts`
  - `backend/src/routes/users.routes.ts`
  - `backend/src/routes/monitoring.routes.ts`
  - `backend/src/routes/webhooks.routes.ts`
- Core service layer already exists under `backend/src/services/`
- Data model already exists in `backend/prisma/schema.prisma`

### Frontend

- Next.js App Router app: `frontend/app/`
- Shared UI and feature components: `frontend/components/`
- Auth hooks and state: `frontend/hooks/`, `frontend/store/`
- Typed API client: `frontend/lib/api.ts`
- Auth wrapper: `frontend/components/auth-provider.tsx`
- Clerk-safe helpers: `frontend/lib/clerk-safe.ts`
- Current user-facing routes already exist:
  - `/`
  - `/about`
  - `/catalog`
  - `/inventory`
  - `/product/[skuId]`
  - `/quote`
  - `/checkout`
  - `/checkout/success`
  - `/dashboard`
  - `/support`
  - `/admin/health`

## 4. Working Model

- One side owns backend changes, one side owns frontend changes.
- The shared contract is the API response shape and the route list.
- The first milestone is not "feature complete". It is "one request path works and is observable".
- Keep the backend and frontend dev servers running throughout the work.
- Use absolute URLs only where necessary; otherwise keep the frontend talking through `NEXT_PUBLIC_API_URL`.

## 5. Contract Rules

- Frontend talks only to `/api/*`.
- Frontend does not import backend code, Prisma, Stripe server SDKs, or Clerk server internals.
- Backend returns consistent envelopes:
  - `success`
  - `data`
  - `error`
  - `meta` where pagination applies
- Money stays in cents end-to-end in API payloads and database fields.
- `skuId` remains the inventory primary key.
- The frontend should never assume backend response shapes that are not already documented or tested.

## 6. Phase 0 - Baseline Audit

Goal: verify the current starting point before touching integration behavior.

- [ ] Confirm backend starts cleanly with the current env file.
- [ ] Confirm frontend starts cleanly with the current env file.
- [ ] Confirm the backend CORS origin includes the frontend origin used in local dev.
- [ ] Confirm `frontend/lib/api.ts` points at the correct backend base URL.
- [ ] Confirm the backend route mount points in `backend/src/app.ts` match what the frontend expects.
- [ ] Confirm there is no hidden plan drift from older docs that still refer to `services/api` or `apps/web`.
- [ ] Confirm the current auth model is Clerk-based in both apps before changing any auth code.

Exit criteria:

- A developer can run both apps locally and hit at least one backend route from the browser.

## 7. Phase 1 - Health Check

Goal: prove the pipe is open.

### Backend

- [ ] Verify `GET /api/health` returns a stable response shape.
- [ ] Verify `GET /health` is either intentionally supported or intentionally ignored.
- [ ] Verify CORS allows the frontend origin in local development.
- [ ] Verify the health route is safe to call without auth.
- [ ] Verify the health response includes a timestamp and backend readiness signal.

### Frontend

- [ ] Add or reuse a tiny probe path that calls `GET /api/health`.
- [ ] Ensure the frontend uses the shared API base URL from `frontend/lib/api.ts`.
- [ ] Surface failures clearly in the UI or console.
- [ ] Keep the probe simple; do not entangle it with auth yet.
- [ ] Fix known Phase 0 client contract drift before trusting health-based integration progress:
- [ ] Parse named backend keys like `brands`, `models`, `hierarchy`, `inventory`, `parts`, and `part` instead of assuming `data`.
- [ ] Consume detailed health `services` as an array and preserve backend `green|yellow|red` statuses.
- [ ] Default local development to the local backend URL instead of the production deployment.

Exit criteria:

- Browser fetch works without CORS errors.
- `curl` against the health route returns `200` or a clearly explained non-200 state.
- The frontend can show the backend health result from the live API.

## 8. Phase 2 - Auth and Identity Contract

Goal: make user identity flow across the boundary without changing the product model.

### Backend

- [ ] Verify Clerk auth middleware is mounted intentionally and not breaking public routes.
- [ ] Verify guest identity behavior is still supported where the repo expects it.
- [ ] Verify protected routes return the correct status codes when no token is supplied.
- [ ] Verify webhook routes are isolated and use raw body handling where required.
- [ ] Verify `backend/prisma/schema.prisma` still matches the auth assumptions in the service layer.

### Frontend

- [ ] Verify `frontend/components/auth-provider.tsx` wraps the app correctly when Clerk is configured.
- [ ] Verify `frontend/lib/clerk-safe.ts` is still the fallback for environments without keys.
- [ ] Verify `frontend/hooks/useAuth.ts` hydrates user state from the backend profile correctly.
- [ ] Verify `frontend/store/authStore.ts` remains the single source of truth for logged-in UI state.
- [ ] Verify protected UI routes and admin views behave correctly when signed out.

Exit criteria:

- Signed-in and signed-out states are distinguishable on both sides.
- API calls with and without tokens behave predictably.
- No auth-related console noise blocks the integration work.

## 9. Phase 3 - Read-Only Catalog / Inventory Integration

Goal: prove the frontend renders live backend data without mutating anything.

### Backend

- [ ] Verify catalog routes return the hierarchy and inventory data the frontend already expects.
- [ ] Verify SKU, brand, model, generation, and compatibility payloads are stable.
- [ ] Verify `backend/src/services/catalog.service.ts` and `inventory.service.ts` map data into frontend-friendly shapes.
- [ ] Verify any caching used here does not change the response contract.
- [ ] Verify not-found and empty-state behavior is explicit.

### Frontend

- [ ] Verify `frontend/lib/api.ts` calls the live catalog and inventory endpoints.
- [ ] Verify `/catalog`, `/inventory`, and `/product/[skuId]` only use backend data, not hardcoded mocks.
- [ ] Verify `frontend/components/product/*` tolerate missing images, empty specs, and no-match states.
- [ ] Verify `frontend/components/device-explorer.tsx` and related sections do not assume a stale schema.
- [ ] Verify the same data can be rendered in cards, lists, and detail views without shape drift.

Exit criteria:

- A live inventory item can be loaded from the backend and rendered on at least one frontend page.
- Product, compatibility, and hierarchy views all survive missing or partial data.

## 10. Phase 4 - Cart, Quote, and Checkout

Goal: connect the storefront workflow end-to-end.

### Backend

- [ ] Verify cart routes persist and validate quantities correctly.
- [ ] Verify quote routes accept the fields the frontend sends.
- [ ] Verify checkout creates the correct payment/order state and returns the fields the frontend needs.
- [ ] Verify webhook handling updates payment/order state safely.
- [ ] Verify user ownership checks prevent one account from reading another account’s commerce data.

### Frontend

- [ ] Verify `frontend/store/cartStore.ts` and `frontend/hooks/useCart.ts` remain consistent with server-side cart sync.
- [ ] Verify `frontend/components/cart-drawer.tsx` and `frontend/components/checkout-section.tsx` present the same cart quantities the backend will accept.
- [ ] Verify `frontend/components/quote-section.tsx` submits the expected quote payload.
- [ ] Verify checkout success / failure pages reflect real backend outcomes.
- [ ] Verify any auth token used for checkout or orders is fetched from the current Clerk session path.

Exit criteria:

- A user can add to cart, submit checkout, and see a predictable success or error state.
- A quote request and an order request each hit the correct endpoint and return useful feedback.

## 11. Phase 5 - Orders, Dashboard, and Admin

Goal: make post-checkout and operational views trustworthy.

### Backend

- [ ] Verify orders routes enforce ownership and return the expected pagination/summary shape.
- [ ] Verify user routes return the correct profile and role data.
- [ ] Verify monitoring routes are admin-only where appropriate.
- [ ] Verify health detail routes do not leak data to unauthorized callers.

### Frontend

- [ ] Verify `frontend/components/dashboard-section.tsx` loads user orders and cart state correctly.
- [ ] Verify `frontend/app/admin/health/page.tsx` handles auth and backend failures gracefully.
- [ ] Verify navigation and footer links land on the right routes after integration.
- [ ] Verify loading, empty, and error states are distinct and understandable.

Exit criteria:

- Signed-in users can see their own order history.
- Admin-only views fail closed for non-admins.

## 12. Phase 6 - Hardening

Goal: reduce integration regressions after the core flow works.

- [ ] Add or update integration tests for the routes that the frontend depends on most.
- [ ] Add or update frontend tests for the pages/components that use live backend data.
- [ ] Confirm response envelopes are consistent across all integrated routes.
- [ ] Confirm CORS, auth, and webhook behaviors are documented in the repo.
- [ ] Confirm the plan and the docs no longer refer to stale path names from older repo layouts.
- [ ] Confirm the development workflow is repeatable from a fresh checkout.

Exit criteria:

- The integration can be reproduced without tribal knowledge.
- The first person on the repo can run both apps and verify the health check without guessing.

## 13. Suggested Parallel Ownership

### Frontend owner

- Own `frontend/app/`
- Own `frontend/components/`
- Own `frontend/hooks/`
- Own `frontend/store/`
- Own `frontend/lib/api.ts` and frontend auth wrappers

### Backend owner

- Own `backend/src/`
- Own `backend/prisma/`
- Own backend env, route, service, middleware, and webhook wiring

### Shared

- Agree on API shapes before changing UI assumptions.
- Confirm route names and payload fields before writing new frontend code.
- Test each phase before moving on.

## 14. Confidence And Risks

### Confidence

- High confidence that this can be completed.
- My estimate is about **85-90%** if the current backend and frontend are already running and the environment variables are available.

### Main Risks

- Backend env mismatch between local and deployment.
- CORS/origin mismatch during local development.
- Auth token handling drifting between frontend hooks and backend middleware.
- Checkout/payment/webhook shape mismatch.
- Prisma schema or seed state not matching the runtime assumptions.
- Old documentation still suggesting a different repo layout.

### Why Confidence Is High

- The repo already contains the major backend and frontend feature slices.
- The integration work is mostly contract alignment, not greenfield implementation.
- The health check gives an early proof point.
- The API client already centralizes most frontend calls.

## 15. Decision Point

- If you want me on the frontend lane, I can focus there while you keep the backend lane moving.
- If you want me to own backend orchestration instead, I can switch and drive the API contract from that side.
- In either case, the first thing to keep visible is `GET /api/health`.
