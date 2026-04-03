# Backend-Frontend Integration Checklist

**Project**: ctir-v4 Ecommerce Monorepo  
**Status**: Integration Phase Planning  
**Last Updated**: 2026-04-03

---

## Integration Phases Overview

This checklist follows a **slow rollout strategy** with clear contract boundaries. Each phase proves one system works before moving forward. Frontend only talks to `/api/*` endpoints—never directly to databases, SDKs, or external services.

---

## Phase 1: API Health Check ✅

**Goal**: Prove the pipe is open. Frontend can reach backend. CORS works. Server is running.

### Backend Setup
- [ ] `services/api/src/server.ts` created and listening on port (e.g., 3001)
- [ ] `services/api/src/app.ts` configured with Express/server framework
- [ ] `services/api/src/config/env.ts` loads all environment variables (verify with `console.log` or logging)
- [ ] CORS middleware configured to allow `http://localhost:3000` (frontend origin)
  - [ ] `Access-Control-Allow-Origin: http://localhost:3000`
  - [ ] `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
  - [ ] `Access-Control-Allow-Headers: Content-Type, Authorization`
- [ ] Simple health endpoint created:
  ```typescript
  GET /api/health
  Response: { status: "ok", timestamp: "2026-04-03T..." }
  ```
- [ ] Server starts without errors: `pnpm dev` (from monorepo root)

### Frontend Setup
- [ ] `apps/web/lib/api-client.ts` created with base fetch configuration
  ```typescript
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  ```
- [ ] `.env.local` in `apps/web` has `NEXT_PUBLIC_API_URL=http://localhost:3001`
- [ ] Test endpoint created (e.g., `/api/health` route or a test component)
- [ ] Fetch works: `fetch("http://localhost:3001/api/health")`

### Success Criteria
- [ ] Browser console shows health response (no CORS errors)
- [ ] Both `pnpm dev` and health check work simultaneously
- [ ] `curl -i http://localhost:3001/api/health` returns 200 with body
- [ ] Frontend can reach backend from any route (not blocked by CORS)

**Timeline**: ~1 hour  
**Blockers**: Server not starting, CORS misconfigured, env vars missing

---

## Phase 2: Products API (Mock Data)

**Goal**: Wire frontend to backend without database. Prove the API contract + rendering work.

### Backend Setup
- [ ] `services/api/src/modules/products/products.routes.ts` created
- [ ] `services/api/src/modules/products/products.controller.ts` created
- [ ] Mock data defined (in memory for now):
  ```typescript
  const MOCK_PRODUCTS = [
    { id: "sku1", name: "Battery", price: 9.99 },
    { id: "sku2", name: "Screen", price: 20.00 }
  ]
  ```
- [ ] Endpoint implemented:
  ```typescript
  GET /api/products
  Response: { data: MOCK_PRODUCTS, success: true }
  ```
- [ ] Routes registered in `app.ts`
- [ ] Test with `curl http://localhost:3001/api/products`

### Frontend Setup
- [ ] Hook created: `apps/web/hooks/useProducts.ts`
  ```typescript
  export function useProducts() {
    const [products, setProducts] = useState([])
    useEffect(() => {
      fetch("/api/products")
        .then(r => r.json())
        .then(data => setProducts(data.data))
    }, [])
    return products
  }
  ```
- [ ] Component created: `apps/web/components/ProductList.tsx`
- [ ] Component uses hook and renders product list
- [ ] ProductList added to a page (e.g., `/products` or homepage)
- [ ] `.env.local` has correct `NEXT_PUBLIC_API_URL`

### Success Criteria
- [ ] Products appear on the page (mock data from API, not hardcoded in frontend)
- [ ] Inspect Network tab: `GET /api/products` returns 200 with mock data
- [ ] No console errors (fetch, rendering, hydration)
- [ ] Products display correctly (name, price, id visible)

**Timeline**: ~2 hours  
**Blockers**: Route not mounting, fetch not triggering, env var not passed to frontend

---

## Phase 3: Database Integration (Prisma)

**Goal**: Replace mock data with real database. Same endpoint, different data source. Frontend doesn't change.

### Backend Setup
- [ ] `packages/db/prisma/schema.prisma` has Product model:
  ```prisma
  model Product {
    id    String  @id @default(cuid())
    sku   String  @unique
    name  String
    price Float
    createdAt DateTime @default(now())
  }
  ```
- [ ] Migrations run: `pnpm db:migrate`
- [ ] Seed script created and run: `pnpm db:seed` (adds test products)
- [ ] Prisma client imported in controller:
  ```typescript
  import prisma from '@ctir-v4/db'
  ```
- [ ] `services/api/src/modules/products/products.service.ts` created:
  ```typescript
  export async function getAllProducts() {
    return prisma.product.findMany()
  }
  ```
- [ ] Controller calls service instead of returning mock data
- [ ] Endpoint still returns same shape: `{ data: [...], success: true }`

### Frontend
- [ ] **No changes**. Component and hook remain identical.

### Success Criteria
- [ ] Products page still renders (same visual result)
- [ ] Network tab shows `GET /api/products` returns products from database
- [ ] Database can be verified: `pnpm db:studio` (Prisma Studio) shows products
- [ ] Adding a product to database via Studio → appears on frontend instantly

**Timeline**: ~3 hours (includes schema, migration, seeding)  
**Blockers**: Prisma migration fails, seed crashes, schema mismatch

---

## Phase 4: Clerk Authentication

**Goal**: Add user authentication. Only goal: get `/api/me` endpoint working. Frontend detects logged-in state.

### Backend Setup
- [ ] Clerk API keys added to `.env.local` in `services/api`:
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `CLERK_PUBLISHABLE_KEY`
- [ ] `packages/auth/clerk-server.ts` created:
  ```typescript
  import { clerkClient } from '@clerk/backend'
  export async function verifyToken(token) {
    // Verify JWT from frontend
  }
  ```
- [ ] `services/api/src/middleware/auth.ts` created:
  ```typescript
  export async function verifyAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token' })
    const user = await verifyToken(token)
    req.user = user
    next()
  }
  ```
- [ ] `services/api/src/modules/auth/auth.routes.ts` created:
  ```typescript
  GET /api/me (protected)
  Response: { user: { id, email, role }, success: true }
  ```
- [ ] Middleware applied to `/api/me`

### Frontend Setup
- [ ] Clerk publishable key in `.env.local`:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
  ```
- [ ] `ClerkProvider` wraps app in `apps/web/app.tsx` (or `_app.tsx` for pages router)
- [ ] Hook created: `apps/web/hooks/useUser.ts`
  ```typescript
  import { useAuth } from '@clerk/nextjs'
  export function useUser() {
    const { getToken, userId } = useAuth()
    const [user, setUser] = useState(null)
    useEffect(() => {
      if (userId) {
        getToken().then(token => {
          fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(r => r.json())
          .then(data => setUser(data.user))
        })
      }
    }, [userId, getToken])
    return user
  }
  ```
- [ ] Login/Logout buttons created using Clerk UI components
- [ ] User context or state set globally so any component can call `useUser()`

### Success Criteria
- [ ] Click "Sign Up" → Clerk modal appears
- [ ] After login, `useUser()` returns `{ id, email, role }`
- [ ] Network tab shows `GET /api/me` returns user data
- [ ] Reload page → user still logged in (token persists)
- [ ] Click "Sign Out" → `useUser()` returns null, UI updates
- [ ] Unauthorized request (no token) → `GET /api/me` returns 401

**Timeline**: ~4 hours (includes Clerk setup, token handling, frontend integration)  
**Blockers**: Clerk keys wrong, token verification fails, hydration mismatch

---

## Phase 5: Redis Caching (Optional but Recommended)

**Goal**: Prove Redis works. Start simple: set, get, expiry.

### Backend Setup
- [ ] Upstash Redis credentials in `.env.local`:
  - [ ] `REDIS_URL=https://...`
  - [ ] `REDIS_TOKEN=...`
- [ ] `services/api/src/lib/redis.ts` created:
  ```typescript
  import { Redis } from '@upstash/redis'
  export const redis = new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
  ```
- [ ] Test endpoint created:
  ```typescript
  GET /api/cache-test
  Backend:
    await redis.set('test', 'hello', { ex: 60 })
    const value = await redis.get('test')
    return { value, success: true }
  ```
- [ ] Test with `curl http://localhost:3001/api/cache-test`

### Frontend
- [ ] (Optional) Simple button to hit `/api/cache-test`

### Success Criteria
- [ ] `GET /api/cache-test` returns `{ value: "hello", success: true }`
- [ ] Call again within 60s → still returns "hello"
- [ ] Call after 60s → returns null (expired)
- [ ] Upstash dashboard shows the key exists

**Timeline**: ~1.5 hours  
**Blockers**: Upstash credentials wrong, Redis client not connecting, firewall blocking

---

## Phase 6: Stripe Checkout (Payment)

**Goal**: Prove Stripe integration works. Isolated to two endpoints only: checkout + webhook.

### Backend Setup
- [ ] Stripe API keys in `.env.local`:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `services/api/src/lib/stripe.ts` created:
  ```typescript
  import Stripe from 'stripe'
  export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  ```
- [ ] `services/api/src/modules/payments/checkout.routes.ts` created:
  ```typescript
  POST /api/checkout
  Body: { items: [{ product_id, quantity }] }
  Backend:
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        { price_data: { currency: 'usd', unit_amount: 999 }, quantity: 1 }
      ],
      success_url: 'http://localhost:3000/checkout/success',
      cancel_url: 'http://localhost:3000/checkout/cancel'
    })
    return { sessionId: session.id, url: session.url }
  ```
- [ ] Frontend redirects to `session.url` (Stripe Checkout page)
- [ ] Test product hardcoded (no database yet): `{ price: 9.99, name: 'Test Item' }`

### Frontend Setup
- [ ] Stripe publishable key in `.env.local`:
  ```
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
  ```
- [ ] `apps/web/pages/checkout.tsx` (or route) created
- [ ] Button "Proceed to Checkout" calls:
  ```typescript
  fetch('/api/checkout', { method: 'POST', body: JSON.stringify({ items: [...] }) })
    .then(r => r.json())
    .then(data => window.location = data.url)
  ```
- [ ] Success/Cancel pages created: `/checkout/success` and `/checkout/cancel`

### Success Criteria
- [ ] Click "Proceed to Checkout" → redirected to Stripe Checkout page
- [ ] Stripe test card charges successfully
- [ ] Redirected to success page after payment
- [ ] Stripe Dashboard → Payments tab shows the charge
- [ ] `POST /api/checkout` is the **only** endpoint that touches Stripe (except webhook)

**Timeline**: ~3 hours  
**Blockers**: Stripe keys invalid, redirect URL mismatched, test card declined

---

## Phase 7: Stripe Webhooks

**Goal**: Prove payment completion is logged. Listen for `checkout.session.completed` event.

### Backend Setup
- [ ] `services/api/src/modules/payments/webhook.routes.ts` created:
  ```typescript
  POST /api/webhook
  Verify signature with Stripe secret
  Listen for: checkout.session.completed
  Log: { sessionId, amount, timestamp }
  Return: { received: true }
  ```
- [ ] Middleware to parse raw body (not JSON):
  ```typescript
  app.post('/api/webhook', express.raw({type: 'application/json'}), handler)
  ```
- [ ] Webhook secret in `.env.local`: `STRIPE_WEBHOOK_SECRET`
- [ ] Stripe CLI set up locally for testing:
  ```bash
  stripe listen --forward-to localhost:3001/api/webhook
  stripe trigger payment_intent.succeeded
  ```

### Success Criteria
- [ ] Complete a real Stripe payment (or use `stripe trigger` in CLI)
- [ ] Webhook received: check server logs for `checkout.session.completed`
- [ ] Log shows correct session ID, amount, timestamp
- [ ] No database writes yet (just logging for now)

**Timeline**: ~2 hours  
**Blockers**: Webhook not received, signature verification fails, Stripe CLI not forwarding

---

## Phase 8: Full Feature Integration

**Goal**: Connect all systems. Users → Auth → Products → Cart → Checkout → Payment.

### Features to Wire Together
- [ ] **User Context**: `useUser()` hook available everywhere (via Context or state management)
- [ ] **Products**: Fetched from `/api/products` (Prisma-backed, cached with Redis if enabled)
- [ ] **Cart**: 
  - [ ] `POST /api/cart` (add item)
  - [ ] `GET /api/cart` (fetch user's cart from database)
  - [ ] `DELETE /api/cart/:itemId` (remove item)
  - [ ] Stored in database, linked to `user.id` (from Clerk)
- [ ] **Checkout**: 
  - [ ] `POST /api/checkout` uses real cart items (not hardcoded)
  - [ ] Stripe session includes actual product prices from database
- [ ] **Orders**: 
  - [ ] After `checkout.session.completed` webhook, create Order in database
  - [ ] `GET /api/orders` returns user's orders
  - [ ] Link Order to user and products

### Database Schema Extensions
- [ ] `Cart` model with relation to `User` and `Product`
- [ ] `Order` model with relation to `User`, `Product`, and payment status
- [ ] Migration and seed script updated

### Success Criteria
- [ ] End-to-end flow: Login → Browse Products → Add to Cart → Checkout → Pay → See Order
- [ ] Database contains user's order data
- [ ] Webhook successfully recorded payment
- [ ] Reload page → cart and orders persist (data in database, not session)

**Timeline**: ~6-8 hours (depends on complexity of cart/order logic)  
**Blockers**: Data not persisting, relations not set up, missing database fields

---

## Post-Integration: Optimization & Scaling

Once all systems work:

- [ ] **Caching Strategy**: Cache products, user data, orders with Redis
- [ ] **Error Handling**: Consistent error response format across all endpoints
- [ ] **Logging**: Structured logging for debugging (use Winston, Pino, or similar)
- [ ] **Rate Limiting**: Protect endpoints from abuse (especially `/api/checkout`)
- [ ] **Security**: 
  - [ ] Validate all inputs (Zod schema for request bodies)
  - [ ] Never expose sensitive keys in responses
  - [ ] HTTPS enforced in production
- [ ] **Testing**: Unit tests for services, integration tests for endpoints
- [ ] **Documentation**: API docs (Swagger/OpenAPI) generated from code
- [ ] **Monitoring**: Sentry or DataDog for error tracking in production
- [ ] **Database Indexes**: Add indexes for frequently queried fields (user.id, product.id, etc.)

---

## Troubleshooting Quick Reference

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| CORS error | `Access-Control-Allow-Origin` not set | Update CORS middleware to allow frontend origin |
| 404 on `/api/health` | Route not registered | Verify route mounted in `app.ts` |
| Env vars undefined | `.env.local` not loaded | Check `process.env.VAR_NAME` and file location |
| Clerk token fails | Token expired or invalid | Regenerate token, check Clerk keys |
| Stripe payment fails | Wrong API key or test card | Verify `STRIPE_SECRET_KEY`, use test cards from Stripe docs |
| Redis timeout | Upstash credentials wrong | Verify `REDIS_URL` and `REDIS_TOKEN` |
| Database migration fails | Schema syntax error | Run `prisma validate`, check migrations folder |
| Hydration mismatch (Next.js) | Server-rendered state differs from client | Use `useEffect` for fetches, wrap with `<Suspense>` if needed |

---

## Notes for the Team

- **Golden Rule**: Frontend only talks to `/api/*`. Never import backend modules, Prisma, Clerk SDK internals, or Stripe client.
- **Contract Boundary**: The API response shape is the contract. Both teams agree on it and don't break it.
- **Mock Data First**: If an endpoint isn't ready, return mock data. Frontend doesn't care.
- **Error Responses**: Always return `{ error: string, success: false, code?: string }` for errors.
- **Deployment**: Use Vercel for frontend, platform of choice for backend (Railway, Render, Heroku, custom).

---

## Related Files & Commands

```bash
# Development
pnpm dev                    # Start everything (frontend + backend + db migrations)
pnpm db:migrate            # Run pending migrations
pnpm db:studio             # Open Prisma Studio (visual DB browser)
pnpm db:seed               # Seed test data

# Testing Endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/products

# Stripe Testing
stripe listen --forward-to localhost:3001/api/webhook
stripe trigger checkout.session.completed

# Logs & Debugging
tail -f services/api/logs/app.log
echo $STRIPE_SECRET_KEY     # Verify env vars are set
```

---

**Version**: 1.0  
**Last Updated**: 2026-04-03  
**Owner**: Backend + Frontend Team  
**Status**: ✅ Ready for Execution
