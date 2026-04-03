# Backend Roadmap Aligned to Frontend UI Phases 0–10

**Status:** Recommended epics and task breakdown for backend reset preservation strategy  
**Date:** 2026-03-25  
**Preserved in Reset:** schema.prisma, seed.ts, smart SKU logic, config  

---

## Frontend UI Phases (Reference)

| Phase | Goal | Scope |
|-------|------|-------|
| **0** | Stabilize system surface | Button/input standardization, friction reduction |
| **1** | Commerce basics | Storefront feel, catalog/inventory UI |
| **2** | Forms & request workflows | Buyer interactions (quote, requests) |
| **3** | Support & trust surfaces | Post-purchase, FAQs, confidence building |
| **4** | Account & checkout shells | Auth & Stripe prep (mock → real) |
| **5** | Final integration pass | Real service wiring |
| **6–10** | Extended features | Advanced inventory, B2B tools, analytics, etc. |

---

## Recommended Backend Epics & Sequencing

### **Epic 1: Schema & Foundation** *(Aligns to UI Phase 0)*
**Goal:** Establish 4-level device hierarchy, auth/commerce tables, smart SKU flexibility.  
**Dependencies:** None (blocking all others)  
**Status:** ✅ Complete (Phases 1–2 done)

**Tasks:**
- [x] Schema evolution (4-level: Brand → ModelType → Generation → Variant)
- [x] Specification table (normalized, not JSONB)
- [x] Smart SKU compatibility (nullable variantId + CompatibilityMap)
- [x] Auth & commerce tables (User, Account, Session, Cart, Order, OrderLine)
- [x] Prisma migrate + generate
- [x] Seed.ts rewrite (preserve all sample data)

**Preserved in Reset:** ✅ schema.prisma, seed.ts

---

### **Epic 2: Core Infrastructure** *(Aligns to UI Phase 0–1)*
**Goal:** Production-ready Express app, error handling, middleware stack, logging, env config.  
**Dependencies:** Epic 1 (schema + prisma generate)  
**Status:** ✅ Complete

**Tasks:**
- [x] Zod env validation (fail-fast startup)
- [x] PrismaClient singleton (Neon + serverless adapter)
- [x] Express app factory (testable, graceful shutdown)
- [x] Middleware stack (CORS, parsing, auth, validation, rate-limiting, error handler)
- [x] Structured logging (Pino: pretty dev, JSON prod)
- [x] Error mapping (Zod → 400, Prisma → 409/404, Stripe → 402, JWT → 401)
- [x] Health check routes (/health, /api/health)

**Preserved in Reset:** ✅ Config (env.ts, middleware patterns)

---

### **Epic 3: Catalog & Inventory** *(Aligns to UI Phase 1)*
**Goal:** Read-only browsing API—backwards-compatible with existing frontend.  
**Dependencies:** Epic 2  
**Status:** ⏳ Planned (endpoints stubbed)

**Tasks:**
- [ ] **3.1 Brand Browsing** (GET /api/brands)
  - Returns all brands with counts
  - Dependency: Epic 2
  - Frontend UI: Brand filters (Inventory page)
  
- [ ] **3.2 Model Type Browsing** (GET /api/brands/:brandId/models)
  - Returns model types for a brand
  - Dependency: 3.1
  - Frontend UI: Model filters (Inventory page)
  
- [ ] **3.3 SKU Lookup & Stock** (GET /api/inventory, GET /api/inventory/:skuId)
  - Returns paginated SKU list with stock levels, pricing, category
  - Dependency: Epic 2
  - Frontend UI: Catalog page, product list
  
- [ ] **3.4 Part Specifications** (GET /api/inventory/:skuId/specs)
  - Returns normalized key/value specs
  - Dependency: 3.3
  - Frontend UI: Product detail page
  
- [ ] **3.5 Compatibility Matrix** (GET /api/compatibility/:skuId)
  - Returns compatible variants (multi-level)
  - Dependency: 3.3
  - Frontend UI: Product detail fitment checker
  
- [ ] **3.6 Search & Filtering** (GET /api/search, query params: category, quality, priceMin/Max)
  - Full-text search + faceted filtering
  - Dependency: 3.3, 3.4
  - Frontend UI: Catalog filters, search bar

**Smart SKU Preservation:** ✅ variantId nullable + CompatibilityMap for cross-compatible parts

---

### **Epic 4: Authentication & Authorization** *(Aligns to UI Phase 4)*
**Goal:** Secure JWT-based login, registration, token lifecycle, role-based access.  
**Dependencies:** Epic 3 (catalog so users can browse first)  
**Status:** ⏳ Planned

**Tasks:**
- [ ] **4.1 User Registration** (POST /api/auth/register)
  - Email validation, bcrypt hashing, rate limiting (5 req/min)
  - Returns JWT + refresh token
  - Dependency: Epic 2
  - Frontend UI: Registration form (future dashboard)
  
- [ ] **4.2 User Login** (POST /api/auth/login)
  - Email/password validation, JWT generation, session creation
  - Rate limiting (10 failed attempts → 15 min lockout)
  - Dependency: 4.1
  - Frontend UI: Login form
  
- [ ] **4.3 Token Refresh** (POST /api/auth/refresh)
  - Validates refresh token, issues new JWT
  - Dependency: 4.2
  - Frontend UI: Auto-refresh on app boot
  
- [ ] **4.4 Logout** (POST /api/auth/logout)
  - Blacklist token in Redis, clear session
  - Dependency: 4.2
  - Frontend UI: Account menu logout action
  
- [ ] **4.5 Auth Middleware + RBAC**
  - Verify JWT, extract user role (BUYER/ADMIN)
  - Protect /api/cart, /api/checkout, /api/orders, admin routes
  - Dependency: 4.3
  - Frontend UI: Protected pages (dashboard, checkout)

**Preserved in Reset:** ✅ Config (cuid() ID strategy, bcrypt config, JWT secrets)

---

### **Epic 5: Commerce (Cart, Checkout, Orders)** *(Aligns to UI Phase 4–5)*
**Goal:** Server-side cart persistence, Stripe integration, order creation, B2B multi-day quoting.  
**Dependencies:** Epic 4 (auth required for cart ownership)  
**Status:** ⏳ Planned

**Tasks:**
- [ ] **5.1 Cart Service** (POST/PUT/DELETE /api/cart)
  - Server-side cart (SKU + qty) attached to user session
  - Enforce MOQ (minimum order quantity)
  - Cart summary endpoint
  - Dependency: Epic 4
  - Frontend UI: Cart page, add-to-cart button
  
- [ ] **5.2 Cart Persistence**
  - Redis caching for fast reads (expires after 30 days)
  - PostgreSQL for durable storage
  - Sync on checkout or session timeout
  - Dependency: 5.1
  - Frontend UI: Preserve cart across sessions
  
- [ ] **5.3 Checkout Service** (POST /api/checkout)
  - Create Stripe PaymentIntent from cart
  - Calculate totals (SKU price × qty + tax + shipping)
  - Validate stock before payment
  - Dependency: 5.1, Epic 4
  - Frontend UI: Checkout form, payment section
  
- [ ] **5.4 Stripe Webhook Handler** (POST /api/checkout/webhook)
  - Verify webhook signature
  - Handle payment_intent.succeeded → create Order
  - Handle payment_intent.payment_failed → notify user
  - Idempotency via webhook ID deduplication
  - Dependency: 5.3
  - Frontend UI: Order confirmation page
  
- [ ] **5.5 Order Creation & History** (GET/POST /api/orders)
  - Create Order + OrderLines on payment success
  - List orders (paginated) for authenticated user
  - Return order details (status, items, total)
  - Dependency: 5.4
  - Frontend UI: Order history, order detail page
  
- [ ] **5.6 Order Tracking** (GET /api/orders/:orderId)
  - Full order detail (items, pricing snapshot, shipping, status history)
  - Dependency: 5.5
  - Frontend UI: Order status page

**Preserved in Reset:** ✅ Config (Stripe API version, price formatting in cents, MOQ logic)

---

### **Epic 6: Admin & Reporting** *(Aligns to UI Phase 6+)*
**Goal:** Internal dashboards, inventory management, sales reporting.  
**Dependencies:** Epic 5 (commerce data needed for reports)  
**Status:** 🔮 Future

**Tasks:**
- [ ] **6.1 Inventory Management** (PATCH /api/admin/inventory/:skuId)
  - Update stock levels, pricing, active status
  - Requires ADMIN role
  - Dependency: Epic 4
  
- [ ] **6.2 Sales Dashboard** (GET /api/admin/reports/sales)
  - Revenue, order count, top SKUs, trends
  - Dependency: 5.5, Epic 4
  
- [ ] **6.3 Stock Alerts** (GET /api/admin/alerts/low-stock)
  - Notify on inventory below threshold
  - Dependency: 6.1

---

## Dependency Graph (Critical Path)

```
Epic 1: Schema & Foundation
    ↓ (prisma generate required)
Epic 2: Core Infrastructure
    ├─→ Epic 3: Catalog & Inventory
    │      ↓ (browsing before checkout)
    │   Epic 4: Authentication
    │      ├─→ Epic 5: Commerce
    │      │      ├─→ Epic 6: Admin & Reporting
    │      │
    │      └─→ (Other auth-protected routes)
    │
    └─→ (Health checks, logging, error handling)
```

**Critical Path Length:** ~6–8 weeks (serial: Phase 1–2 ✅ + Phase 3 + Phase 4 + Phase 5)

---

## Reset Preservation Rules

| Artifact | Action | Why |
|----------|--------|-----|
| `schema.prisma` | KEEP & EVOLVE | 4-level hierarchy, smart SKU logic, auth/commerce tables |
| `prisma/seed.ts` | KEEP & EVOLVE | Sample data with realistic variants, inventory, pricing |
| Smart SKU logic | KEEP | variantId nullable + CompatibilityMap pattern for cross-compatible parts |
| Config (env.ts, middleware) | KEEP & EVOLVE | Zod validation, error mapping, logging setup |
| `server.ts` & routes | REWRITE | Rebuild with service layer, new endpoints, error handling |
| Legacy files (.replit, server.py, index.html) | DELETE | Clean up before Phase 6 |
| Tests | REWRITE | Expand from 49 to 80+ (backwards compatibility + new features) |

---

## Example Task Breakdown: Epic 3.3 (SKU Lookup)

**Title:** Implement SKU Lookup Endpoint (GET /api/inventory/:skuId)  
**Story Points:** 5  
**Dependencies:** Epic 2 complete  
**Frontend UI:** Product list, catalog grid, product detail page  

**Acceptance Criteria:**
- [ ] Endpoint returns inventory SKU with: id, sku, name, category, wholesalePrice (in cents), stockLevel, images, description
- [ ] Includes related Specification records (label + value pairs)
- [ ] Includes related Variant (if variantId is set) with modelNumber, marketingName, brand, modelType, generation
- [ ] Includes CompatibilityMap entries (if variantId is NULL, cross-compatible)
- [ ] Returns 404 if SKU not found
- [ ] Response shape matches existing backend response (backwards compatible)
- [ ] Covered by integration test + backwards compatibility snapshot test
- [ ] Latency < 200ms (p95) with caching

**Implementation Steps:**
1. Create `src/services/inventory.ts` with `getInventoryBySkuId(skuId: string)` service function
2. Create `src/routes/inventory.ts` with GET /:skuId endpoint
3. Register route in app factory
4. Write test: `src/__tests__/inventory.test.ts` (snapshot + latency)
5. Test backwards compatibility vs old backend response

**Definition of Done:**
- Code reviewed & approved
- Tests passing (unit + integration + backwards compat)
- No TypeScript errors
- API response logged and validated

---

## Notes for Planning

1. **Parallel Work:** Epics 3–5 can start once Epic 2 completes (Catalog doesn't block Auth, but Auth gates Commerce)
2. **Frontend Readiness:** UI Phase 0–1 can proceed while backend completes Phase 3; checkout shells can be built while Phase 5 auth/commerce endpoints complete
3. **Testing Strategy:** Each epic includes backwards compatibility tests for existing endpoints; new endpoints covered by integration + unit tests
4. **Deployment:** Each epic can be deployed independently to staging; production rollout gates on full test suite + regression tests

---

*Prepared by Rovo Dev Sub-Agent | 2026-03-25*
