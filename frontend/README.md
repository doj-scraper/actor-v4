# CellTech Distributor — Frontend

> **Last updated:** 2026-03-24 · **Sprint:** MVP Frontend Restructure

B2B wholesale mobile repair parts platform. A catalog-first, dark-themed Next.js application for CellTech Distributor — selling OEM-grade phone components (screens, batteries, boards, cameras) to repair shops at wholesale prices.

---

## Quick Start

```bash
cd celltech-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Backend API:** `https://celltech-backend.vercel.app` (auto-configured via `.env.local`)

---

## Repository Map

This project lives inside the repository root:

```
.
├── celltech-backend/               ← Backend (Express + Prisma + Neon PostgreSQL)
│   ├── server.ts                   ← Express API (16 endpoints)
│   ├── schema.prisma               ← Database schema (Brand→Model→Inventory)
│   ├── seed.ts                     ← Seed script for sample data
│   └── vercel.json                 ← Backend deployment config
│
├── celltech-frontend/              ← Frontend (this directory)
│   ├── app/                        ← Next.js App Router
│   │   ├── layout.tsx              ← Root layout (Nav + Footer persistent shell)
│   │   ├── page.tsx                ← Home (5 sections: Hero, Categories, Products, Partners, CTA)
│   │   ├── about/page.tsx          ← About (Quality, Shipping, Testimonials)
│   │   ├── catalog/page.tsx        ← Parts catalog (filterable product grid)
│   │   ├── inventory/page.tsx      ← Inventory table (Brand/Model filtering)
│   │   ├── product/[skuId]/page.tsx← Product detail page (gallery, fitment, specs, add-to-cart)
│   │   ├── quote/page.tsx          ← Request a quote
│   │   ├── support/page.tsx        ← Support & FAQ
│   │   ├── dashboard/page.tsx      ← Account dashboard
│   │   ├── not-found.tsx           ← 404 page
│   │   └── globals.css             ← Theme variables, utility classes, overlays
│   ├── components/
    │   ├── navigation.tsx          ← Persistent sticky nav (Catalog, Inventory, About, Quote, Support, Account)
    │   ├── footer-section.tsx      ← Multi-column footer (contact, hours, social)
    │   ├── hero-section.tsx        ← Landing hero (pinned 100vh)
    │   ├── categories-section.tsx  ← Category grid (pinned 100vh)
    │   ├── products-section.tsx    ← Product cards with Link to /product/[skuId]
    │   ├── partners-section.tsx    ← Brand logos bar
    │   ├── cta-section.tsx         ← Call-to-action (pinned 100vh)
    │   ├── quality-section.tsx     ← Lab-verified quality (used on /about)
    │   ├── shipping-section.tsx    ← Global dispatch (used on /about)
    │   ├── testimonials-section.tsx← Customer testimonials (used on /about)
    │   ├── checkout-section.tsx    ← Checkout preview (legacy, not on landing)
    │   ├── quote-section.tsx       ← Quote form (used on /quote)
    │   ├── support-section.tsx     ← Support content (used on /support)
    │   ├── dashboard-section.tsx   ← Dashboard content (used on /dashboard)
    │   ├── RootLayout.tsx          ← DEPRECATED — layout now in app/layout.tsx
    │   └── product/                ← Product detail components
    │       ├── FitmentChecker.tsx   ← Model number search with match/no-match feedback
    │       ├── ProductGallery.tsx   ← Image gallery with category-based images + cyan glow
    │       ├── CompatibilityMatrix.tsx ← Accordion of all compatible devices
    │       └── AddToCartButton.tsx  ← Quantity selector + cart integration (MOQ=5)
    ├── store/
    │   ├── cartStore.ts            ← Zustand cart (sku, name, price, qty, moq, image)
    │   ├── appStore.ts             ← App state (notifications, dark mode)
    │   └── authStore.ts            ← Auth state (user, login, logout)
    ├── lib/
    │   ├── api.ts                  ← Typed API client (20+ endpoints)
    │   └── utils.ts                ← cn() helper for class merging
    ├── hooks/                      ← Custom React hooks
    ├── public/images/              ← Static product images & placeholders
    ├── tailwind.config.js          ← Full design system (ct-* tokens)
    └── package.json                ← Dependencies & scripts
```

---

## Tech Stack

| Layer       | Technology                                  |
|-------------|---------------------------------------------|
| Framework   | Next.js 15 (App Router, RSC)                |
| Language    | TypeScript (Strict)                         |
| Styling     | Tailwind CSS + custom `ct-*` tokens         |
| Animation   | Framer Motion                               |
| State       | Zustand (cart, auth, app)                   |
| API Client  | Native Fetch with typed interfaces          |
| Icons       | Lucide React                                |
| Fonts       | Sora, Inter, IBM Plex Mono (next/font)      |
| Backend     | Express.js + Prisma + Neon PostgreSQL       |
| Deployment  | Vercel (frontend + backend)                 |

---

## Design System

### Color Palette (`ct-*` tokens)

| Token                | Hex       | Tailwind Class          | Usage                    |
|----------------------|-----------|-------------------------|--------------------------|
| `ct-bg`              | `#070A12` | `bg-ct-bg`              | Page background          |
| `ct-bg-secondary`    | `#111725` | `bg-ct-bg-secondary`    | Cards, sections          |
| `ct-accent`          | `#00E5C0` | `text-ct-accent`        | Buttons, links, badges   |
| `ct-text`            | `#F2F5FA` | `text-ct-text`          | Primary text             |
| `ct-text-secondary`  | `#A7B1C6` | `text-ct-text-secondary`| Muted/secondary text     |

### Typography

| Role    | Font           | Usage                          |
|---------|----------------|--------------------------------|
| Display | Sora           | Headings, uppercase, bold      |
| Body    | Inter           | Body copy, descriptions        |
| Mono    | IBM Plex Mono  | SKUs, labels, technical data   |

### Utility Classes (globals.css)

- `.heading-display` — uppercase Sora heading
- `.text-micro` — 10px mono label
- `.btn-primary` / `.btn-secondary` — CTA buttons
- `.card-dark` / `.product-card` / `.testimonial-card` — card variants
- `.filter-chip` / `.badge` — interactive pills
- `.section-pinned` (100vh) / `.section-flowing` (min-100vh) — layout modes
- `.nav-link` / `.link-arrow` — navigation styles

---

## Routes

| Path                | Description                        | Data Source         |
|---------------------|------------------------------------|---------------------|
| `/`                 | Landing (Hero→Categories→Products→Partners→CTA) | API: searchParts |
| `/about`            | Quality + Shipping + Testimonials  | Static content      |
| `/catalog`          | Filterable product grid            | API: searchParts    |
| `/inventory`        | Full inventory table with Brand/Model filters | API: fetchInventory, fetchBrands, fetchModels |
| `/product/[skuId]`  | Product detail page (gallery, fitment, specs, cart) | API: getPartDetails |
| `/quote`            | Request a quote form               | Pending backend     |
| `/support`          | Support & FAQ                      | Static content      |
| `/dashboard`        | Account dashboard                  | Pending auth        |

---

## Layout Architecture (as of 2026-03-24)

Navigation and Footer are rendered **once** in `app/layout.tsx` — they persist across all routes. Individual pages render only their content inside `<main>`.

```
app/layout.tsx
├── <Navigation />          ← Always visible, fixed sticky
├── <main className="flex-1">
│   └── {children}          ← Route content swaps here
└── <FooterSection />       ← Always visible
```

> **Note:** `components/RootLayout.tsx` is now deprecated. It was the old per-page wrapper pattern. All pages now rely on `app/layout.tsx` for the shell.

---

## Roadmap

- [x] Next.js App Router Migration
- [x] Backend API Integration (Inventory/Catalog)
- [x] Landing page slimmed to 5 focused sections
- [x] Persistent layout (Nav + Footer in root layout)
- [x] /about route (Quality, Shipping, Testimonials)
- [x] Product detail page with gallery, fitment checker, specs, compatibility matrix
- [x] Product cards link to /product/[skuId]
- [x] Navigation updated (Catalog, Inventory, About, Quote, Support, Account)
- [ ] Schema migration (Smart SKU buckets, nullable fixes, Specification table)
- [ ] NextAuth integration (User, Account, Session)
- [ ] Server-side cart persistence (B2B multi-day quoting)
- [ ] Device Explorer two-panel catalog (/catalog upgrade)
- [ ] Checkout flow with order creation
- [ ] Functional quote submission
- [ ] User dashboard with order history
- [ ] `npm run build` verification (requires `npm install` with network)
- [ ] Unit & integration testing
