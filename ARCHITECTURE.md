# Architecture

Technical architecture reference for CellTech Distributor.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Vercel Edge                       │
│  ┌──────────────────┐       ┌─────────────────────────┐ │
│  │   Frontend        │       │   Backend               │ │
│  │   Next.js 15      │──API──│   Express.js            │ │
│  │   React 19        │       │   @vercel/node          │ │
│  │   Zustand         │       │                         │ │
│  │   Tailwind CSS    │       │   Prisma ORM            │ │
│  └──────────────────┘       └──────────┬──────────────┘ │
└──────────────────────────────────────────┼───────────────┘
                                           │
          ┌────────────────────────────────┼────────────────┐
          │                                │                │
   ┌──────▼──────┐  ┌──────────────┐  ┌───▼────────┐  ┌───▼──┐
   │ Neon Postgres│  │ Clerk        │  │ Stripe     │  │Redis │
   │ (serverless) │  │ (auth)       │  │ (payments) │  │(cache)│
   └─────────────┘  └──────────────┘  └────────────┘  └──────┘
```

## Database Schema

### Product Hierarchy (4 levels)

```
Brand
  └─ ModelType          (e.g., "iPhone", "Galaxy S")
      └─ Generation     (e.g., "iPhone 13", releaseYear: 2021)
          └─ Variant    (e.g., "iPhone 13 Pro Max", modelNumber: "A2643")
```

### Inventory

```
Inventory (PK: skuId — Smart SKU format)
  ├─ partName              "iPhone 13 Lightning Charging Port"
  ├─ wholesalePrice        Int (cents). 0 = "Contact for Price"
  ├─ qualityGrade          OEM | Premium | Aftermarket | Unknown | NA
  ├─ stockLevel            Int
  ├─ category → Category
  ├─ specifications[]      { label, value } pairs
  └─ compatibilities[]     → CompatibilityMap → Variant
```

**Smart SKU format:** `[Bucket]-[Subcategory]-[Grade]-[Device]`
- Bucket: product category number
- Subcategory: part type code
- Grade: O(EM), P(remium), A(ftermarket)
- Device: abbreviated device identifier

### Commerce

```
Cart
  ├─ userId → User
  ├─ skuId → Inventory
  ├─ quantity (MOQ: 5)
  └─ Unique(userId, skuId)

Order
  ├─ userId → User
  ├─ status: PENDING → CONFIRMED → PAID → SHIPPED → DELIVERED
  ├─ totalCents
  ├─ stripePaymentIntentId
  └─ lines[] → OrderLine (snapshots price/name at purchase time)

QuoteRequest
  ├─ email, company, contactName, phone, notes
  ├─ userId (nullable — guests can submit)
  ├─ status: RECEIVED → REVIEWING → RESPONDED → CLOSED
  └─ items[] → QuoteRequestItem { skuId, quantity, note }
```

### Users & Auth

```
User
  ├─ clerkId (nullable — null for guests)
  ├─ email (unique)
  ├─ role: BUYER | ADMIN
  ├─ isGuest: boolean
  └─ customId: "userid-g00123" (guest format)
```

Guest-to-account merge: when a Clerk user signs up with a matching email, the existing guest record is upgraded (preserving cart + order history) rather than creating a duplicate.

### Monitoring

```
SystemEvent     — category, severity, message, metadata
MetricSnapshot  — name, value, unit
AlertRule       — condition (JSON), action, evaluation interval
AlertNotification — status lifecycle (ACTIVE → ACKNOWLEDGED → RESOLVED)
```

## Authentication

Three-tier middleware chain:

| Middleware | Behavior | Used By |
|-----------|----------|---------|
| `authMiddleware` | Passive — populates `req.auth` if token present, never blocks | All routes (global) |
| `requireAuth` | Enforces auth, hydrates `req.user` from DB, returns 401/403 | Cart, orders, users, monitoring |
| `optionalAuth` | Hydrates `req.user` if token present, allows anonymous | Quote, some catalog routes |
| `requireRole(…)` | Checks `req.user.role`, returns 403 if insufficient | Admin/monitoring endpoints |

**Graceful degradation:** When `CLERK_SECRET_KEY` is absent, `authMiddleware` becomes a no-op passthrough. Protected routes return 401, public routes work normally. The frontend's `useSafeClerkAuth()` and `useSafeClerkUser()` hooks return safe fallback objects, preventing crashes.

## API Route Architecture

All routes mounted under `/api/` in `backend/src/app.ts`:

```
POST /api/webhooks/clerk              Clerk user sync (signed)

GET  /api/health                      Liveness probe
GET  /api/health/detailed             Full system check (admin)

GET  /api/brands                      All brands
GET  /api/models                      All model types
GET  /api/hierarchy                   Full 4-level tree
GET  /api/parts                       Search parts (?device=)
GET  /api/variants/:id/parts          Parts for specific variant
GET  /api/categories                  All categories

GET  /api/inventory                   Paginated inventory
GET  /api/inventory/:skuId            Single SKU detail
GET  /api/inventory/:skuId/specs      Specifications
GET  /api/inventory/:skuId/stock      Stock level
POST /api/inventory/bulk-stock        Bulk stock check
POST /api/inventory                   Create SKU (admin)
PUT  /api/inventory/:skuId            Update SKU (admin)

GET  /api/compatibility/:skuId        Compatible devices

GET  /api/cart                        Get cart (spreads at root)
POST /api/cart/items                  Add item
PUT  /api/cart/items/:skuId           Update quantity
DELETE /api/cart/items/:skuId         Remove item
DELETE /api/cart                      Clear cart
POST /api/cart/validate               Validate cart
POST /api/cart/sync                   Sync localStorage → server
GET  /api/cart/summary                Cart summary
GET  /api/cart/count                  Item count
POST /api/cart/merge                  Merge guest → user cart
POST /api/cart/transfer               Transfer cart ownership

POST /api/checkout/create-intent      Create Stripe payment intent
POST /api/checkout/guest              Guest checkout
POST /api/checkout/webhook            Stripe webhook

GET  /api/orders                      Order history
GET  /api/orders/:id                  Order detail
GET  /api/orders/:id/status           Order status
POST /api/orders                      Create order

POST /api/quote                       Submit quote request
GET  /api/quote/:id                   Get quote status

GET  /api/users/profile               Get profile
PUT  /api/users/profile               Update profile

GET  /api/monitoring/events           System events (admin)
GET  /api/monitoring/metrics          Metric snapshots (admin)
...+11 more monitoring endpoints
```

## Frontend Architecture

### State Management (Zustand)

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `appStore` | Global UI state | Memory |
| `authStore` | User identity, role, loading state | Memory |
| `cartStore` | Cart items, quantities, totals | localStorage |
| `deviceStore` | Device hierarchy selection | Memory |
| `quoteStore` | Quote form state, product search | Memory |

### Page Structure (App Router)

| Route | Type | Data Source |
|-------|------|-------------|
| `/` | SSR | `searchParts()` for featured products |
| `/catalog` | Client | `fetchHierarchy()` → device explorer |
| `/inventory` | Client | `fetchInventory()`, `fetchBrands()`, `fetchModels()` |
| `/product/[skuId]` | SSR | `getPartDetails(skuId)` |
| `/quote` | Client | `submitQuoteRequest()` on form submit |
| `/checkout` | Client | Cart store + `createPaymentIntent()` |
| `/dashboard` | Client | Protected, requires auth |
| `/sign-in`, `/sign-up` | Client | Clerk hosted forms |
| `/admin/health` | Client | `fetchHealth()`, admin-only |

### Design System

**Dark-first theme** built on custom CSS variables and Tailwind utilities:

| Token | Value | Usage |
|-------|-------|-------|
| `ct-bg` | `#070A12` | Main background |
| `ct-bg-secondary` | `#111725` | Card/panel backgrounds |
| `ct-accent` | `#00E5C0` | Primary accent (buttons, links, highlights) |
| `ct-text` | `#F2F5FA` | Primary text |
| `ct-text-secondary` | `#A7B1C6` | Muted text |

**Typography:**
- Headings: **Sora** (400–800)
- Body: **Inter** (400–600)
- Code/data: **IBM Plex Mono** (400–500)

**Custom utility classes** (defined in `globals.css`):
`dashboard-card` · `card-dark` · `btn-primary` · `btn-secondary` · `heading-display` · `text-micro` · `filter-chip` · `product-card` · `input-dark`

### Component Library

96 components built on:
- **Radix UI** — 20+ accessible primitives (dialog, select, accordion, etc.)
- **shadcn/ui** — styled Radix wrappers
- **Framer Motion** — animations and transitions
- **Lucide** — icon library

## Deployment

### Backend (Vercel Serverless)

```
vercel.json → builds api/index.ts with @vercel/node
api/index.ts → exports createApp() (Express app, no listen())
Build: prisma generate && tsc
All requests → api/index.ts (catch-all route)
```

### Frontend (Vercel Next.js)

```
vercel.json → framework: nextjs
Build: next build
Output: .next/
Standard Next.js deployment with automatic ISR/SSR
```

### Required Vercel Environment Variables

**Backend project:**
`DATABASE_URL` · `DIRECT_URL` · `CORS_ORIGIN` · `CLERK_PUBLISHABLE_KEY` · `CLERK_SECRET_KEY` · `STRIPE_SECRET_KEY`

**Frontend project:**
`NEXT_PUBLIC_API_URL` · `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` · `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
