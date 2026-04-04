# Copilot Instructions for CellTech (actor-v4)

**Repository:** `doj-scraper/actor-v4`  
**Stack:** Node.js/Express backend + Next.js 15 frontend, Prisma/Neon Postgres, Vercel Services deployment  
**Status:** Production-deployed (frontend ✅, backend has known runtime issue — see DEBUGNOTES.md)

---

## 🎯 Core Rules

### Role Boundaries
- **Backend dev**: Own `backend/` — do NOT modify `frontend/` code unless explicitly authorized
- **Frontend dev**: Own `frontend/` — do NOT modify `backend/` code unless explicitly authorized
- **When unclear**: Ask the user first rather than assuming scope

### Deployment Priority
When the app is live (even partially):
1. **Documentation & delivery** take priority over debugging
2. **If debugging isn't progressing in 2-3 attempts**, stop and pivot to documentation/case studies
3. **The user can debug themselves** if the codebase is well-documented and the website is up
4. Never suggest "let me keep trying" — instead offer to document what you've learned and move on

### No Secrets in Commits
- **GitHub secret scanning will block any push containing credentials**
- Use `.env` files (gitignored) locally and Vercel env vars for production
- If a push is rejected by secret scanning: use `git rebase -i` to remove the offending commit, then force-push
- Reference: Earlier session scrubbed secrets from git history via interactive rebase — this works

---

## 🏗️ Architecture Quick Reference

### Monorepo Structure
```
actor-v4/
├── backend/           Express.js, Prisma ORM, 52 API endpoints
├── frontend/          Next.js 15, Zustand stores, shadcn/ui
└── vercel.json        Vercel Services config (experimentalServices)
```

### Vercel Services (Experimental)
- **Single project** (`actor-v4` on Vercel, `team_zrIgDvZoPlY3ZUuXc871BAmW`)
- **Two services under one domain:**
  - Frontend: routePrefix `/`, framework `nextjs`, lives at `/`
  - Backend: routePrefix `/_/backend`, lives at `/_/backend/*`
- **Key behavior:** Vercel **strips the routePrefix** before forwarding to the service
  - A request to `/_/backend/api/health` arrives at Express as `/api/health`
  - Backend code doesn't need the prefix in route definitions
- **Root vercel.json** at repo root (not in subdirectories)

### Database
- **Neon PostgreSQL** (serverless, pooled via `@neondatabase/serverless`)
- **Prisma ORM** with 19 models (product hierarchy, commerce, users, monitoring)
- **Key constraint:** `DATABASE_URL` must be set before backend build (build fails if missing)

### Auth & Payments
- **Clerk:** Conditional middleware — becomes a no-op when `CLERK_SECRET_KEY` is absent (for local dev)
- **Stripe:** Server-side only, checkout route requires `STRIPE_SECRET_KEY`
- **Production auth requirement:** `actor-v4.vercel.app` must be added to Clerk dashboard as allowed origin (NOT done yet)

### API Contracts (PERMANENT — Do Not Change)
Documented in `BACKENDREPORT.md` Entry 1 and confirmed in `FRONTENDREPORT.md` Entry 3:
- **Catalog routes** (`/api/catalog/*`): return named keys `{ brands: [...] }`, `{ models: [...] }`, `{ parts: [...] }`, `{ hierarchy: [...] }`
- **Commerce routes** (`/api/checkout`, `/api/orders`): return `{ success: boolean, data: {...} }`
- **Cart GET** (`/api/cart`): spreads data at root level (NOT nested under `data`)
- **Prices:** Always `Int` in cents. Frontend divides by 100. `wholesalePrice === 0` means "Contact for Price" — never display $0.00

---

## 🔧 Build, Test & Dev Commands

### Backend
```bash
cd backend

# Development
npm run dev                # Start dev server with hot reload (tsx watch), port 3001
npm run build              # TypeScript compile (tsc)
npm run vercel-build       # Vercel build: prisma generate && tsc
npm run typecheck          # Type check without emitting
npm test                   # Run Vitest suite
npm test -- --run tests/api-client.test.ts  # Single test file

# Database
npx prisma db push        # Push schema to database (creates/modifies tables)
npx prisma db seed        # Seed with test data (runs prisma/seed.ts)
npx prisma studio        # Visual DB browser on http://localhost:5555
npx prisma migrate dev   # Create a migration with history (use for production)

# Debug
npm run lint              # ESLint check
```

### Frontend
```bash
cd frontend

# Development
npm run dev               # Next.js dev server with Turbopack, port 3000
npm run build             # Production build
npm run start             # Start production server
npm test                  # Run Vitest suite
npm run lint              # Next.js lint
```

### Testing Integration Locally
```bash
# Terminal 1: Backend
cd backend && npm run dev
# Should log: "✓ Server listening on http://localhost:3001"

# Terminal 2: Frontend
cd frontend && npm run dev
# Should log: "Local: http://localhost:3000"

# Terminal 3: Test endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/catalog/brands
curl http://localhost:3001/api/catalog/hierarchy
```

---

## 📚 Documentation Map

| File | Purpose | Read When |
|------|---------|-----------|
| `README.md` | Project overview, quickstart | First orientation |
| `ARCHITECTURE.md` | System diagrams, DB schema, auth flow, complete API reference | Understanding how things work |
| `FINALREPORT.md` | 475-line case study with development history and decisions | Learning why things were built this way |
| `DEBUGNOTES.md` | Vercel backend 500 error analysis with theories and fixes | Debugging the deployment issue |
| `DEPLOYCONFIGINSTRUCT.md` | Vercel Services setup JSON config | Deploying to Vercel |
| `backend/AGENTS.md` | Current project state, next steps, build instructions | AI agent context |
| `BACKENDREPORT.md` | 11 entries — backend dev log with API contracts | Tracing specific backend work |
| `FRONTENDREPORT.md` | 8 entries — frontend dev log and API contract confirmations | Understanding frontend decisions |
| `TEMPLATE.md` | Comprehensive project expert agent (524 lines) | Creating a custom Copilot agent |
| `TEMPLATE.yaml` | Custom agent config in YAML format | GitHub Copilot cloud agent setup |

### Document Control System
- **BACKENDREPORT.md** and **FRONTENDREPORT.md** are paired: each side signs off on the other's entries
- **Entry format:** Date/time, phase, work description, sign-off
- This prevented integration bugs and maintains a clear audit trail
- Continue this pattern for future phases

---

## 🚀 Deployment Process

### Pre-Deployment Checklist
1. **Code committed** — `git status` is clean
2. **Local builds pass** — `npm run build` in both `backend/` and `frontend/`
3. **Tests pass** — `npm test` (or skip for frontend if no test changes)
4. **Env vars documented** — list all required vars and their values
5. **Secrets NOT in code** — no credentials in committed files

### Env Vars Required (13 backend + 3 frontend)
**Backend (`backend/.env`):** DATABASE_URL, DIRECT_URL, NODE_ENV, JWT_SECRET (32+ chars in prod), JWT_EXPIRES_IN, CORS_ORIGIN, CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, STRIPE_SECRET_KEY, REDIS_URL (optional)

**Frontend (`frontend/.env.local`):** NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

**Setting on Vercel:**
```bash
vercel env add KEY_NAME production --scope crodacroda --force
```

### Known Issues
1. **Backend returns 500 on Vercel** (`FUNCTION_INVOCATION_FAILED`) — builds succeed but crashes at runtime
   - Root cause: Env vars may not be reaching the serverless function
   - Full analysis: See `DEBUGNOTES.md`
   - Theories: `builds`/`routes` conflict with Services mode, missing `"framework": "express"` in root vercel.json
   - **Do NOT keep debugging this indefinitely** — document findings and move on

2. **Clerk auth fails on production domain** — `actor-v4.vercel.app` not added to Clerk dashboard allowed origins

3. **Webhooks not configured** — Clerk and Stripe webhooks exist as endpoints but aren't wired in their dashboards

---

## 🎯 Next Steps (Prioritized)

1. **Fix backend FUNCTION_INVOCATION_FAILED** — Suggested fixes in DEBUGNOTES.md
2. **Add actor-v4.vercel.app to Clerk allowed origins** — Required for production auth
3. **Configure Clerk webhook** → `https://actor-v4.vercel.app/_/backend/api/webhooks/clerk`
4. **Configure Stripe webhook** → `https://actor-v4.vercel.app/_/backend/api/checkout/webhook`
5. **Seed production database** — Currently has test data

---

## ⚠️ Critical Conventions

### Code Style & Patterns
- **No Tailwind v4** — Project uses v3. A v4 migration was attempted and reverted because it broke shadcn/ui components
- **Always use `--no-pager`** with git commands in scripts to avoid interactive hangs: `git --no-pager status`
- **Price math:** Backend stores Int cents, frontend divides by 100 at display
- **Prices of $0:** Never render — `wholesalePrice === 0` means "Contact for Price"

### Git Workflow
- **Commit format:** Descriptive message + trailers
- **Co-author trailer:** Always include `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
- **Secrets handling:** If secret scanning blocks a push, use interactive rebase to remove the offending commit:
  ```bash
  git rebase -i HEAD~1
  # Mark the commit as 'edit', remove the secret, then 'git rebase --continue'
  git push --force-with-lease
  ```

### Testing
- Both backend and frontend use **Vitest**
- Run single test: `npm test -- --run path/to/test.ts`
- Frontend tests are documented in `frontend/lib/api.ts` (api-client.test.ts exists and passes)
- Backend has 16 test files (run with `npm test`)

---

## 🔑 When to Ask for Clarification

- **Role scope unclear** — Ask which component(s) you own before making changes
- **Deployment blocked** — If env vars are missing or secrets get rejected, ask the user rather than creating new ones
- **Debugging not progressing** — After 2-3 attempts, pivot to documentation instead of continuing to iterate
- **Vercel configuration uncertain** — Ask which project, team, and environment (production/preview/development) before making env var changes
- **API contract ambiguity** — Confirm with user before changing response shapes (they're permanent)

---

## 📖 Reading Order for New Context

1. Start with: **this file** (you're reading it)
2. Then: **README.md** (project overview)
3. Then: **ARCHITECTURE.md** (technical deep dive)
4. Then: **FINALREPORT.md** (case study + decisions)
5. Reference as needed: **BACKENDREPORT.md**, **FRONTENDREPORT.md**, **DEBUGNOTES.md**

---

## 🧠 Session Continuity

If resuming a session:
1. **Read the most recent checkpoint** in the session directory (e.g., `005-finalreport-and-vercel-debug-d.md`)
2. **Check BACKENDREPORT.md and FRONTENDREPORT.md** for the latest entries
3. **Confirm deployment status** on Vercel project `actor-v4`
4. **Ask the user what they want to do next** rather than assuming continuation of previous debugging

---

**Last updated:** 2026-04-04  
**Status:** Production-deployed (frontend live, backend needs runtime fix)  
**Contact:** Copilot CLI / GitHub Copilot cloud agent
