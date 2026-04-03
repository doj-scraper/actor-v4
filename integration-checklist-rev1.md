# Backend ↔ Frontend Integration Checklist — Rev 1

**Project**: CellTech Distributor (ctir-v4) B2B Wholesale Parts Platform  
**Status**: Integration Phase — Wiring Two Complete Codebases  
**Revision Date**: 2026-04-03  
**Stack**: Next.js 15 · Express.js · Prisma · Neon PostgreSQL · Clerk · Stripe · Upstash Redis

---

## What This Plan IS

Both the **backend** (Express API, 53 endpoints, 11 services, 13+ Prisma models) and the **frontend** (Next.js 15, 11 routes, 40+ components, typed API client, Zustand state) are **fully built**. They share the same API contract (`{ success, data, error, meta }`), field names, and price-in-cents convention.

This plan **wires them together** — environment setup, database initialization, connectivity verification, and filling the specific integration gaps (Stripe Elements, cart sync, sign-in pages).

### What Already Exists (Do NOT Rebuild)

| Layer | What's Done |
|---|---|
| **Backend server** | `src/app.ts` + `src/index.ts` — Express with CORS, JSON parsing, Pino logging, graceful shutdown |
| **Backend routes** | 10 route files, 53 endpoints (catalog, inventory, cart, checkout, orders, quotes, users, health, webhooks, monitoring) |
| **Backend services** | 11 service classes — all business logic (CatalogService, InventoryService, CartService, CheckoutService, OrderService, etc.) |
| **Backend auth** | `@clerk/express` middleware — `authMiddleware`, `requireAuth`, `optionalAuth`, `requireRole` (conditional: skips when `CLERK_SECRET_KEY` absent) |
| **Backend Stripe** | `src/lib/stripe.ts` + `CheckoutService` — PaymentIntent creation, webhook signature verification, order status transitions |
| **Backend Redis** | `src/lib/redis.ts` + `runtime-cache.ts` — Upstash client with in-process LRU fallback |
| **Backend validation** | Zod schemas on all inputs via `src/middleware/validate.ts` |
| **Backend error handling** | Centralized `errorHandler.ts` — maps Zod, Prisma, Stripe, JWT errors to standard JSON |
| **Prisma schema** | 13+ models: User, Brand, ModelType, Generation, Variant, Category, Inventory, Specification, CompatibilityMap, Cart, Order, OrderLine, QuoteRequest, QuoteRequestItem, SystemEvent, MetricSnapshot, AlertRule, AlertNotification, SystemCounter |
| **Frontend API client** | `lib/api.ts` — 20+ typed functions matching every backend endpoint (fetchHierarchy, fetchInventory, fetchCart, createCheckout, fetchOrders, fetchUserProfile, submitQuoteRequest, fetchSystemHealth, etc.) |
| **Frontend auth** | `@clerk/nextjs` — AuthProvider, middleware protecting `/dashboard` + `/admin`, `useAuth()` hook syncing Clerk session → backend User profile |
| **Frontend cart** | Zustand store with localStorage persistence, MOQ enforcement, price-in-cents, SSR-safe |
| **Frontend checkout** | Full checkout UI — cart review, contact form, address, shipping method, payment terms, order summary, guest/authenticated flow |
| **Frontend pages** | Landing, Catalog (DeviceExplorer), Inventory (table+filters), Product Detail (gallery, specs, fitment, compatibility, add-to-cart), Checkout, Checkout Success, Quote, Dashboard, Admin Health, About, Support |
| **Frontend components** | 40+ shadcn/ui components, form components (FormInput, AddressForm, PhoneInput, PasswordStrength), product components (ProductGallery, FitmentChecker, CompatibilityMatrix, AddToCartButton) |

---

## Phase 0: Fix API Contract Mismatches (BLOCKING)

**Goal**: Fix confirmed bugs in `frontend/lib/api.ts` that will cause every browsing page to render empty and the admin health page to hide outages. These must be fixed before any integration testing.

**Time estimate**: ~30-45 minutes

### Bug 1: Response Key Mismatch (All Catalog & Inventory Endpoints)

The backend does NOT return data under a `data` key. Each endpoint uses its own named key:

| Endpoint | Backend returns | Frontend reads | Result |
|---|---|---|---|
| `GET /api/brands` | `{ success, brands }` | `res.data` | `undefined` → `[]` |
| `GET /api/models` | `{ success, models }` | `res.data` | `undefined` → `[]` |
| `GET /api/hierarchy` | `{ success, hierarchy }` | `res.data` | `undefined` → `[]` |
| `GET /api/parts` | `{ success, parts }` | `res.data` | `undefined` → `[]` |
| `GET /api/inventory` | `{ success, inventory }` | `res.data` | `undefined` → `[]` |
| `GET /api/inventory/:skuId` | `{ success, part }` | `res.data` | `undefined` → `null` |
| `GET /api/inventory/model/:modelId` | `{ success, parts }` | `res.data` | `undefined` → `[]` |
| `GET /api/inventory/variants/:variantId/parts` | `{ success, parts }` | `res.data` | `undefined` → `[]` |

**Two valid strategies** — pick one and apply consistently:

**Option A (fix frontend):** Update each `api.ts` function to read the correct key:
```typescript
// Before:
export async function fetchBrands() {
  const res = await apiFetch<ApiResponse<...>>('/api/brands');
  return res.data ?? [];  // ← reads wrong key
}

// After:
export async function fetchBrands() {
  const res = await apiFetch<{ success: boolean; brands: ... }>('/api/brands');
  return res.brands ?? [];  // ← reads correct key
}
```

**Option B (fix backend):** Standardize all backend routes to use `data`:
```typescript
// Before (catalog.routes.ts):
res.json({ success: true, brands });

// After:
res.json({ success: true, data: brands });
```

**Recommendation:** Option B (fix backend) — it enforces the documented `{ success, data, error, meta }` contract from AGENTS.md. But Option A is faster if backend changes are risky.

- [ ] Fix `fetchBrands()` — read `brands` key (or standardize backend)
- [ ] Fix `fetchModels()` — read `models` key
- [ ] Fix `fetchHierarchy()` — read `hierarchy` key
- [ ] Fix `searchParts()` — read `parts` key
- [ ] Fix `fetchInventory()` — read `inventory` key
- [ ] Fix `fetchInventoryBySku()` — read `part` key
- [ ] Fix `fetchInventoryByModel()` — read `parts` key
- [ ] Fix `fetchPartsForVariant()` — read `parts` key
- [ ] Fix `getPartDetails()` — read `part` key
- [ ] Verify all other endpoints (`cart`, `checkout`, `orders`, `users`, `quote`) — check if they use `data` or named keys too

### Bug 2: Health Status Mapping Is Wrong

`frontend/lib/api.ts` line 468-475:
```typescript
function mapServiceStatus(backendStatus: 'UP' | 'DOWN', ...) { ... }
```

Backend `health.service.ts` already returns `'green' | 'yellow' | 'red'` — NOT `'UP' | 'DOWN'`. The frontend re-maps values that don't exist, so `'red'` services appear as `'green'`.

- [ ] Fix: Remove the `mapServiceStatus` function. Backend already sends the correct `green/yellow/red` values — pass them through directly.
- [ ] Update `fetchSystemHealth()` type: change `status: 'UP' | 'DOWN'` to `status: 'green' | 'yellow' | 'red'`
- [ ] Also: Backend returns `services` as an **array**, but the TypeScript type says `Record<string, ...>`. Fix the type to match `ServiceHealth[]`.

### Bug 3: Silent Production Fallback

`frontend/lib/api.ts` line 15-16:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://ctir-backendv1-official.vercel.app';
```

If `NEXT_PUBLIC_API_URL` is missing, local dev silently hits production. This hides CORS problems and sends test data to the live database.

- [ ] Fix: Throw an error or warn loudly in development if the env var is missing:
  ```typescript
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_BASE_URL && process.env.NODE_ENV === 'development') {
    console.warn('[CellTech API] NEXT_PUBLIC_API_URL not set — API calls will fail. Set it in .env.local');
  }
  ```
  Or keep a default only for production builds: 
  ```typescript
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
    ?? (process.env.NODE_ENV === 'production' ? 'https://ctir-backendv1-official.vercel.app' : '');
  ```

### Success Criteria for Phase 0

- [ ] `fetchBrands()` returns actual brand data (not `[]`)
- [ ] Product pages render real products
- [ ] Admin health page shows red services as red
- [ ] Local dev without `NEXT_PUBLIC_API_URL` warns (not silently hits production)

---

## Phase 1: Environment & Database Bootstrap

**Goal**: Both servers start. Database has tables and seed data. Backend responds to health checks.

**Time estimate**: ~30 minutes

### 1.1 Backend Environment

- [ ] Create `backend/.env` from `backend/.env.example`
- [ ] Set `DATABASE_URL` — Neon PostgreSQL pooled connection string
- [ ] Set `DIRECT_URL` — Neon non-pooling connection string (for migrations)
- [ ] Set `PORT=3001`
- [ ] Set `NODE_ENV=development`
- [ ] Set `CORS_ORIGIN=http://localhost:3000` (frontend origin)
- [ ] Set `JWT_SECRET` — any random string for dev (≥32 chars for production)
- [ ] Leave `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `REDIS_URL` empty for now (backend gracefully skips them)

### 1.2 Database Initialization

- [ ] `cd backend && npm install`
- [ ] `npx prisma db push` — creates all 13+ tables in Neon
- [ ] `npx prisma db seed` — populates device hierarchy (brands, models, generations, variants), categories, sample Smart SKU inventory, specifications, compatibility maps
- [ ] Verify with `npx prisma studio` — tables exist and have data

### 1.3 Backend Startup Verification

- [ ] `npm run dev` — server starts on port 3001 without errors
- [ ] `curl http://localhost:3001/api/health` → `{ "success": true, "status": "..." }`
- [ ] `curl http://localhost:3001/api/brands` → returns seeded brands
- [ ] `curl http://localhost:3001/api/hierarchy` → returns full Brand → Model → Generation → Variant tree
- [ ] `curl http://localhost:3001/api/inventory` → returns seeded SKUs with prices (cents), specs, compatibility

### 1.4 Frontend Environment

- [ ] Create `frontend/.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3001
  ```
- [ ] Leave `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` empty for now
- [ ] `cd frontend && npm install`
- [ ] `npm run dev` — starts on port 3000

### Success Criteria

- [ ] `curl http://localhost:3001/api/health` returns 200
- [ ] `curl http://localhost:3001/api/inventory` returns product data from database
- [ ] Frontend loads at `http://localhost:3000` without errors
- [ ] No CORS errors in browser console when frontend fetches from backend

### Troubleshooting

| Symptom | Fix |
|---|---|
| `DATABASE_URL is required` | `.env` file missing or `DATABASE_URL` not set |
| `prisma db push` fails | Check Neon connection string, ensure `?sslmode=require` |
| Seed fails with duplicate key | Seed is idempotent (`upsert`) — check for schema mismatch |
| CORS error in browser | Verify `CORS_ORIGIN=http://localhost:3000` in backend `.env` |
| Frontend shows no data | Verify `NEXT_PUBLIC_API_URL=http://localhost:3001` in `frontend/.env.local` |

---

## Phase 2: Catalog & Product Pages (Verify Existing Wiring)

**Goal**: Frontend product browsing works end-to-end with real data from the database. No code changes expected — just verification.

**Time estimate**: ~15 minutes (verification only)

### 2.1 Landing Page (`/`)

- [ ] Open `http://localhost:3000` — Hero section renders
- [ ] Products section loads via `searchParts()` — shows seeded products
- [ ] Product cards display: name, SKU, price (formatted from cents), quality grade
- [ ] Cards link to `/product/[skuId]`

### 2.2 Inventory Page (`/inventory`)

- [ ] Brand dropdown populated via `fetchBrands()`
- [ ] Model dropdown populated via `fetchModels(brandId)`
- [ ] Inventory table populated via `fetchInventory()`
- [ ] Each row shows: SKU, part name, category, price (cents → USD), stock level, quality grade
- [ ] "View" links go to `/product/[skuId]`

### 2.3 Catalog Page (`/catalog`)

- [ ] DeviceExplorer loads hierarchy via `fetchHierarchy()`
- [ ] Navigate: Brand → ModelType → Generation → Variant
- [ ] Selecting a variant fetches parts via `fetchPartsForVariant(variantId)`
- [ ] Parts display in grid with add-to-cart buttons

### 2.4 Product Detail Page (`/product/[skuId]`)

- [ ] Part details load via `getPartDetails(skuId)`
- [ ] ProductGallery renders (category-based placeholder images)
- [ ] Specifications table shows label/value pairs
- [ ] CompatibilityMatrix accordion shows compatible devices
- [ ] FitmentChecker accepts model number input
- [ ] AddToCartButton works — adds item to Zustand cart with MOQ enforcement
- [ ] Price displays: `$X.XX` or "Contact for Price" when `wholesalePrice === 0`

### 2.5 Network Verification

- [ ] Open DevTools → Network tab
- [ ] All API calls go to `http://localhost:3001/api/*`
- [ ] All responses return `{ success: true, data: [...] }`
- [ ] No 404s, no CORS errors, no console errors

### If Something Breaks

- **Products section empty on landing**: Check that `searchParts()` endpoint works — `curl http://localhost:3001/api/parts?device=iPhone`
- **Inventory table empty**: Verify seed ran — `curl http://localhost:3001/api/inventory` should return items
- **Product detail 404**: Verify SKU exists — `curl http://localhost:3001/api/inventory/{skuId}`
- **Hierarchy empty**: `curl http://localhost:3001/api/hierarchy` — if empty, seed didn't create device tree

---

## Phase 3: Clerk Authentication

**Goal**: Users can sign in/up via Clerk. Backend verifies Clerk JWTs. Protected routes work (cart, checkout, orders, dashboard, admin).

**Time estimate**: ~1-2 hours

### 3.1 Clerk Project Setup (if not done)

- [ ] Create Clerk project at [clerk.com](https://clerk.com)
- [ ] Enable Email + Password sign-in method
- [ ] Note: `Publishable Key` (pk_test_...) and `Secret Key` (sk_test_...)

### 3.2 Backend Clerk Configuration

- [ ] Add to `backend/.env`:
  ```
  CLERK_SECRET_KEY=sk_test_...
  ```
- [ ] Restart backend — `authMiddleware` now active (was no-op without key)
- [ ] Verify: `curl http://localhost:3001/api/brands` still works (public route)
- [ ] Verify: `curl http://localhost:3001/api/cart` returns 401 (protected route, no token)

### 3.3 Clerk Webhook Setup

- [ ] In Clerk Dashboard → Webhooks → Add endpoint
- [ ] URL: your backend webhook URL (for local dev, use ngrok or Clerk's test mode)
  ```
  https://<tunnel>/api/webhooks/clerk
  ```
- [ ] Events to subscribe: `user.created`, `user.updated`, `user.deleted`
- [ ] Copy the signing secret → add to `backend/.env`:
  ```
  CLERK_WEBHOOK_SECRET=whsec_...
  ```
- [ ] Backend already handles these in `src/routes/webhooks.routes.ts`:
  - `user.created` → creates User record (or merges with existing guest by email)
  - `user.updated` → updates email/name
  - `user.deleted` → removes User record

### 3.4 Frontend Clerk Configuration

- [ ] Add to `frontend/.env.local`:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
  CLERK_SECRET_KEY=sk_test_...
  ```
- [ ] Restart frontend
- [ ] `AuthProvider` in `app/layout.tsx` now wraps app with `ClerkProvider`
- [ ] `middleware.ts` now protects `/dashboard` and `/admin` routes

### 3.5 Verify Auth Flow

- [ ] Visit any page — Clerk sign-in/up available (Clerk provides its own UI modal via `@clerk/nextjs`)
- [ ] Sign up with a test email
- [ ] After sign-up: Clerk webhook fires `user.created` → backend creates User record
- [ ] `useAuth()` hook fires → calls `fetchUserProfile(token)` → gets backend User data
- [ ] Visit `/dashboard` — loads (no redirect to sign-in)
- [ ] Network tab: `GET /api/users/profile` returns 200 with user data
- [ ] Sign out → `/dashboard` redirects to Clerk sign-in
- [ ] Verify `curl http://localhost:3001/api/cart` with Bearer token → 200 (empty cart)

### 3.6 Frontend Auth UI Gaps

The frontend currently relies on Clerk's built-in modal for sign-in/sign-up. If dedicated `/sign-in` and `/sign-up` pages are desired:

- [ ] Create `app/sign-in/[[...sign-in]]/page.tsx` using Clerk's `<SignIn />` component
- [ ] Create `app/sign-up/[[...sign-up]]/page.tsx` using Clerk's `<SignUp />` component
- [ ] Style with dark `ct-bg` theme to match the rest of the site
- [ ] Update navigation links if needed

### Troubleshooting

| Symptom | Fix |
|---|---|
| Clerk modal doesn't appear | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` missing or wrong |
| 401 on protected routes | Token not being sent — check `getToken()` in `useAuth()` |
| User profile returns 403 | Webhook didn't fire — User record not in DB. Check Clerk webhook logs |
| Hydration mismatch | Clerk state differs server/client — `useSafeClerkAuth` handles this gracefully |

---

## Phase 4: Cart Sync (Client ↔ Server)

**Goal**: Client-side Zustand cart syncs with backend Cart table on login. Guest cart survives sign-in. Server-side cart enables multi-device and multi-day B2B quoting.

**Time estimate**: ~2-3 hours

### Current State

- Frontend cart: **Zustand + localStorage** — works for guests, but lost on different device/browser
- Backend cart API: **Fully built** — `GET /api/cart`, `POST /api/cart`, `POST /api/cart/sync`, `POST /api/cart/validate`, `PATCH /api/cart/:skuId`, `DELETE /api/cart/:skuId`, `DELETE /api/cart`
- API client functions: **Already exist** — `fetchCart(token)`, `addToCart(skuId, qty, token)`, `validateCart(token)`
- **Gap**: Frontend never calls the backend cart endpoints

### 4.1 Cart Sync on Login

When a user signs in, merge their local cart with their server cart:

- [ ] In `hooks/useAuth.ts` or a new `hooks/useCartSync.ts`:
  - After `fetchUserProfile(token)` succeeds and user is authenticated
  - Call `POST /api/cart/sync` with the current Zustand cart items
  - Backend merges: keeps higher quantities, adds new items
  - Fetch the merged cart back via `GET /api/cart`
  - Replace local Zustand state with server response

### 4.2 Cart Write-Through (Authenticated Users)

When a signed-in user modifies their cart, write to both Zustand AND backend:

- [ ] Create `hooks/useCartSync.ts` (or extend `hooks/useCart.ts`):
  ```typescript
  // Pseudo-logic:
  function addItemSynced(item, token) {
    cartStore.addItem(item);           // Optimistic local update
    addToCart(item.skuId, item.quantity, token);  // Fire-and-forget to backend
  }
  ```
- [ ] `addItem` → `POST /api/cart` (backend)
- [ ] `updateQuantity` → `PATCH /api/cart/:skuId` (backend)
- [ ] `removeItem` → `DELETE /api/cart/:skuId` (backend)
- [ ] `clearCart` → `DELETE /api/cart` (backend)

### 4.3 Cart Validation Before Checkout

- [ ] Before submitting checkout, call `POST /api/cart/validate`
- [ ] Backend checks: stock availability, price changes, MOQ compliance
- [ ] Returns `{ valid: boolean, issues: [...] }` — surface issues to user if invalid
- [ ] Already wired in `lib/api.ts` as `validateCart(token)` — just need to call it in `checkout-section.tsx`

### 4.4 Guest Cart Handling

- [ ] Guest carts remain in localStorage only (no backend sync — no auth token)
- [ ] On sign-in, the sync merges guest cart → server (already covered in 4.1)
- [ ] Guest checkout still works via `createCheckout(null, guestEmail)` — backend creates a guest User + Order

### Success Criteria

- [ ] Sign in → local cart items appear on backend (`prisma studio` → Cart table)
- [ ] Add item while signed in → appears in both local store and backend
- [ ] Sign out, sign in on different browser → cart persists from server
- [ ] Cart validation catches out-of-stock items before checkout

---

## Phase 5: Stripe Payment Integration

**Goal**: Checkout creates a real Stripe PaymentIntent. User confirms payment via Stripe Elements. Webhook updates order status.

**Time estimate**: ~3-4 hours

### Current State

- Backend: **Fully integrated** — `CheckoutService.createCheckout()` creates Stripe PaymentIntent, returns `clientSecret`. Webhook handler processes `payment_intent.succeeded/failed`.
- Frontend: `createCheckout()` API function returns `CheckoutResult` with optional `stripeClientSecret` field
- **Gap**: Frontend doesn't have `@stripe/stripe-js` installed and doesn't render Stripe Elements. Checkout currently creates the order but skips actual payment confirmation.

### 5.1 Stripe Keys

- [ ] Add to `backend/.env`:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- [ ] Add to `frontend/.env.local`:
  ```
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```
- [ ] Restart both servers

### 5.2 Install Stripe Frontend SDK

- [ ] `cd frontend && npm install @stripe/stripe-js @stripe/react-stripe-js`

### 5.3 Create Stripe Client Utility

- [ ] Create `frontend/lib/stripe.ts`:
  ```typescript
  import { loadStripe } from '@stripe/stripe-js';
  
  export const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );
  ```

### 5.4 Update Checkout Flow

The current `checkout-section.tsx` flow is:

```
Place Order → createCheckout(token) → redirect to /checkout/success
```

It needs to become:

```
Place Order → createCheckout(token) → receive clientSecret
  → Show Stripe PaymentElement → User confirms → stripe.confirmPayment()
  → On success → redirect to /checkout/success
  → On failure → show error
```

- [ ] In `checkout-section.tsx`, after `createCheckout()`:
  - If `result.stripeClientSecret` is present (card payment):
    - Show Stripe `<Elements>` wrapper with `<PaymentElement />`
    - User enters card details
    - On submit: `stripe.confirmPayment({ clientSecret })`
    - On success: redirect to `/checkout/success`
  - If no `stripeClientSecret` (Net 30 / wire transfer):
    - Redirect directly to `/checkout/success` (order created as PENDING)

- [ ] The payment method selector (`net-30`, `card`, `wire`) should influence whether backend creates a PaymentIntent:
  - **Card**: Backend creates PaymentIntent → frontend confirms with Stripe Elements
  - **Net 30 / Wire**: Backend creates Order as PENDING → no Stripe involvement

### 5.5 Stripe Webhook (Local Testing)

- [ ] Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (or equivalent)
- [ ] `stripe login`
- [ ] `stripe listen --forward-to localhost:3001/api/checkout/webhook`
- [ ] Copy the webhook signing secret → update `STRIPE_WEBHOOK_SECRET` in `backend/.env`
- [ ] Complete a test payment → verify:
  - Backend logs show `payment_intent.succeeded` event received
  - Order status updated to `PAID` in database
  - `/checkout/success` page shows confirmation

### 5.6 Test Cards

| Card Number | Scenario |
|---|---|
| `4242 4242 4242 4242` | Succeeds |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires 3D Secure |

### Success Criteria

- [ ] Select "Card" payment → Stripe payment form appears
- [ ] Enter test card `4242...` → payment succeeds → order status = PAID
- [ ] Stripe Dashboard → Payments tab shows the charge
- [ ] Webhook fires → backend updates Order status
- [ ] Select "Net 30" → no Stripe form → order created as PENDING
- [ ] Declined card → error shown, order not completed

### Troubleshooting

| Symptom | Fix |
|---|---|
| `loadStripe` returns null | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` missing |
| PaymentIntent fails | `STRIPE_SECRET_KEY` wrong or Stripe account not activated |
| Webhook not received | `stripe listen` not running, or `STRIPE_WEBHOOK_SECRET` mismatch |
| Signature verification fails | Raw body middleware must run BEFORE `express.json()` — already configured in `app.ts` |

---

## Phase 6: Redis Caching & Rate Limiting

**Goal**: Redis accelerates catalog queries and protects endpoints from abuse.

**Time estimate**: ~30 minutes (configuration only — code already exists)

### Current State

- Backend `src/lib/redis.ts`: Upstash Redis client already built
- Backend `src/lib/runtime-cache.ts`: LRU fallback already built
- Backend `src/middleware/rateLimit.ts`: Sliding window rate limiter already built (Redis primary, in-memory fallback)
- Rate limiting already applied to webhook routes
- **Gap**: Just needs the `REDIS_URL` environment variable

### 6.1 Redis Configuration

- [ ] Create an Upstash Redis instance at [upstash.com](https://upstash.com)
- [ ] Add to `backend/.env`:
  ```
  REDIS_URL=https://...@...upstash.io
  ```
- [ ] Restart backend

### 6.2 Verify Redis

- [ ] `curl http://localhost:3001/api/health` — Redis status should show `UP` instead of degraded
- [ ] `curl http://localhost:3001/api/health/detailed` (with admin token) — shows Redis latency
- [ ] Hit the same catalog endpoint twice rapidly — second response should be faster (cached)
- [ ] Check Upstash dashboard — keys visible

### 6.3 Verify Rate Limiting

- [ ] Rapidly hit an endpoint (>100 requests in 60s) → should get 429 with `Retry-After` header
- [ ] Check response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### Success Criteria

- [ ] Health check shows Redis as UP with latency
- [ ] Catalog queries show cache hits on repeated calls
- [ ] Rate limiter returns 429 on abuse

---

## Phase 7: Remaining Feature Wiring

**Goal**: Quote form, dashboard order history, and admin health page work end-to-end.

**Time estimate**: ~2-3 hours

### 7.1 Quote Request Form (`/quote`)

Current state: Frontend has `quoteStore.ts` with **mock products** and a quote builder UI. Backend has `POST /api/quote` + `GET /api/quote/:id` fully implemented.

- [ ] Wire `quote-section.tsx` to call `submitQuoteRequest()` from `lib/api.ts` instead of using mock data
- [ ] On submit: call `POST /api/quote` with `{ email, company, phone, items, notes }`
- [ ] On success: show confirmation with quote request ID
- [ ] Replace mock product search in `quoteStore.ts` with real inventory search via `searchParts()` or `fetchInventory()`

### 7.2 Dashboard Order History (`/dashboard`)

Current state: `dashboard-section.tsx` exists with layout. Backend has `GET /api/orders` (paginated) and `GET /api/orders/:id` fully implemented.

- [ ] Wire dashboard to call `fetchOrders(token)` — display order list with status badges
- [ ] Each order row shows: order ID, date, status, total (cents → USD), item count
- [ ] Click order → calls `fetchOrderDetail(orderId, token)` → shows line items
- [ ] Wire profile section to `fetchUserProfile(token)` and `updateUserProfile(token, data)`

### 7.3 Admin Health Dashboard (`/admin/health`)

Current state: `admin/health/page.tsx` exists and calls `fetchSystemHealth(token)`. Backend `GET /api/health/detailed` requires `ADMIN` role.

- [ ] Verify: sign in as an ADMIN user → page loads with service health statuses
- [ ] Shows: PostgreSQL, Redis, Clerk, Stripe — each with status (green/yellow/red) and latency
- [ ] To test: update a User's role to `ADMIN` via Prisma Studio

### 7.4 Checkout Success Page (`/checkout/success`)

Current state: Page exists, reads `order` and `guest` from URL params.

- [ ] Verify: after successful checkout → redirects here with order ID
- [ ] Guest checkout shows `guestCustomId` for order tracking
- [ ] "Create account" prompt for guests
- [ ] "View orders" link for authenticated users

### Success Criteria

- [ ] Submit quote → backend creates QuoteRequest → confirmation shown
- [ ] Dashboard shows order history with real data
- [ ] Admin health page shows all 4 service statuses
- [ ] Checkout success page renders correctly after payment

---

## Phase 8: End-to-End Flow Verification

**Goal**: Complete user journey works. Every step verified.

**Time estimate**: ~1 hour

### 8.1 Guest Flow

```
Landing (/) → Browse products → Add to cart (MOQ enforced)
  → Checkout (/checkout) → Enter email, address, shipping
  → Payment: Card → Stripe Elements → Confirm → Webhook fires
  → Success (/checkout/success) → Guest ID shown → "Create account" prompt
```

- [ ] Walk through every step — no errors, no broken links
- [ ] Verify: Order created in database with `isGuest: true`
- [ ] Verify: Stripe Dashboard shows the payment

### 8.2 Authenticated Flow

```
Sign up via Clerk → Webhook creates User → Browse catalog (/catalog)
  → DeviceExplorer: Brand → Model → Generation → Variant → Parts
  → Add to cart → Cart synced to backend
  → Checkout → Pay with card → Webhook updates order to PAID
  → Dashboard (/dashboard) → Order appears in history
```

- [ ] Walk through every step
- [ ] Verify: Cart persists server-side
- [ ] Verify: Order history shows in dashboard

### 8.3 Guest → Account Merge

```
Guest checkout (order created) → Later: Sign up with same email
  → Clerk webhook fires user.created → Backend merges guest → clerkId set, isGuest: false
  → Sign in → Dashboard shows the original guest order
```

- [ ] Verify: Guest order history preserved after account creation
- [ ] Verify: `User.isGuest` flipped to `false` in database
- [ ] Verify: `User.clerkId` now set

### 8.4 Edge Cases

- [ ] Add item with `wholesalePrice === 0` → shows "Contact for Price", blocks checkout
- [ ] Attempt checkout with out-of-stock item → cart validation catches it
- [ ] Hit protected route without auth → 401 returned, frontend handles gracefully
- [ ] Stripe payment declined → error shown, order stays PENDING

---

## Post-Integration: Production Hardening

Once all flows work end-to-end:

### Security

- [ ] Validate all inputs via Zod (already done on backend)
- [ ] Never expose secret keys in frontend (`NEXT_PUBLIC_` prefix only for publishable keys)
- [ ] HTTPS enforced in production
- [ ] Add `requireRole('ADMIN')` to monitoring endpoints (currently open — `src/routes/monitoring.routes.ts`)

### Caching Strategy

- [ ] Cache catalog/hierarchy queries in Redis (already built — verify TTLs are appropriate)
- [ ] Consider caching product detail pages with ISR in Next.js

### Error Handling

- [ ] Frontend: Consistent error toasts via Sonner (already installed)
- [ ] Backend: Structured logging via Pino (already configured)
- [ ] Add Sentry or similar for production error tracking

### Testing

- [ ] Backend: `npm test` — all test files pass
- [ ] Frontend: `npm test` — existing tests pass
- [ ] Add integration tests for critical flows (checkout, auth, cart sync)

### Deployment

- [ ] Backend: Vercel serverless via `api/index.ts` (already configured in `vercel.json`)
- [ ] Frontend: Vercel via Next.js (already configured)
- [ ] Set production environment variables on Vercel for both projects
- [ ] Verify `CORS_ORIGIN` includes the production frontend domain

---

## Environment Variables — Complete Reference

### Backend (`backend/.env`)

```bash
# Database (Neon PostgreSQL) — REQUIRED
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Auth (Clerk) — optional for dev, required for auth features
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# JWT (fallback/legacy)
JWT_SECRET=your-secret-here-min-32-chars-for-prod

# Payments (Stripe) — optional for dev, required for checkout
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cache (Upstash Redis) — optional, falls back to in-memory LRU
REDIS_URL=https://...
```

### Frontend (`frontend/.env.local`)

```bash
# Backend API — REQUIRED
NEXT_PUBLIC_API_URL=http://localhost:3001

# Auth (Clerk) — optional, app works without (guest-only mode)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Payments (Stripe) — optional, needed for card checkout
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Quick Command Reference

```bash
# Backend
cd backend
npm install                    # Install dependencies
npm run dev                    # Start dev server (port 3001)
npx prisma db push             # Push schema to database
npx prisma db seed             # Seed test data
npx prisma studio              # Visual database browser
npm test                       # Run tests
npm run typecheck               # TypeScript check

# Frontend
cd frontend
npm install                    # Install dependencies
npm run dev                    # Start dev server (port 3000, Turbopack)
npm run build                  # Production build
npm test                       # Run tests
npm run lint                   # ESLint

# Stripe Local Testing
stripe login
stripe listen --forward-to localhost:3001/api/checkout/webhook
stripe trigger payment_intent.succeeded

# Testing Endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/brands
curl http://localhost:3001/api/inventory
curl http://localhost:3001/api/hierarchy
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/cart
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│  Frontend (Next.js 15 · Port 3000)      │
│                                         │
│  Clerk Auth ←→ AuthProvider             │
│  Zustand ←→ Cart, Auth, App stores      │
│  lib/api.ts ←→ All backend calls        │
│  Stripe Elements ←→ Payment UI          │
│                                         │
│  All data via NEXT_PUBLIC_API_URL        │
│  NEVER imports backend modules directly │
└──────────────┬──────────────────────────┘
               │ HTTP (Bearer JWT)
               ▼
┌─────────────────────────────────────────┐
│  Backend (Express · Port 3001)          │
│                                         │
│  CORS → Raw body → JSON → Metrics      │
│    → Clerk Auth → Route handlers        │
│    → Services → Prisma → Response       │
│    → Error handler                      │
│                                         │
│  Stripe webhooks (signature verified)   │
│  Clerk webhooks (Svix verified)         │
└──────┬──────┬──────┬──────┬─────────────┘
       │      │      │      │
       ▼      ▼      ▼      ▼
    Neon    Upstash  Clerk  Stripe
    (PG)   (Redis)  (Auth) (Pay)
```

---

## Key Contracts (Do NOT Break)

| Rule | Details |
|---|---|
| **Response shape** | `{ success: boolean, data?: T, error?: string, meta?: PaginationMeta }` |
| **Prices in cents** | All monetary values are `Int` (cents). Divide by 100 at display only. |
| **`wholesalePrice === 0`** | Means "Contact for Price" — never show `$0.00` |
| **`skuId` is the PK** | Inventory table uses Smart SKU string as primary key — no surrogate ID |
| **`clerkId` is nullable** | Supports guest users. Never assume `clerkId` is set. |
| **Auth boundary** | Frontend only uses `Bearer <token>` in Authorization header. Backend verifies via Clerk SDK. |
| **API boundary** | Frontend ONLY talks to `/api/*`. Never imports Prisma, Clerk internals, or Stripe server SDK. |

---

**Version**: Rev 1  
**Based on**: Actual codebase analysis (2026-04-03)  
**Owner**: Backend + Frontend Team  
**Status**: ✅ Ready for Execution
