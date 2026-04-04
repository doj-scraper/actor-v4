# DEBUGNOTES.md — Backend Vercel Deployment Debugging

**Date:** April 3–4, 2026  
**Issue:** Backend service returns `FUNCTION_INVOCATION_FAILED` (HTTP 500) on all endpoints  
**Frontend:** ✅ Working — `actor-v4.vercel.app` renders correctly (HTTP 200)  
**Backend:** ❌ All routes return 500 — `actor-v4.vercel.app/_/backend/api/*`

---

## 1. The Error

Every backend endpoint returns:

```
HTTP/2 500
x-matched-path: /_svc/backend/index
x-vercel-error: FUNCTION_INVOCATION_FAILED
x-vercel-cache: MISS

A server error has occurred
FUNCTION_INVOCATION_FAILED
```

The Vercel runtime logs show the error message (truncated):

```
{\"level\":30,\"time\":1775261...
```

This is pino JSON logger output at level 30 (info). The function IS being invoked (the Express request logging middleware fires), but then crashes.

From earlier runtime logs before the messages got truncated, the error was clearly:

```
❌ Invalid environment variables
```

This comes from `backend/src/config/env.ts` line 28–32:

```typescript
if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed in production');
    }
    process.exit(1);
}
```

---

## 2. What We Know

### The build succeeds
All 4 deployments have `state: "READY"`. Build logs confirm:
- `npm run build` → `next build` completes (frontend)
- `prisma generate` → generates client
- `npm run build` → `tsc` completes (backend)
- `✓ Build complete`, `✓ Typecheck complete`

### All 12 env vars ARE set on the Vercel project
Verified via `vercel env ls production --scope crodacroda`:

```
DATABASE_URL                  Encrypted   Production   
DIRECT_URL                    Encrypted   Production   
CLERK_PUBLISHABLE_KEY         Encrypted   Production   
CLERK_SECRET_KEY              Encrypted   Production   
STRIPE_SECRET_KEY             Encrypted   Production   
JWT_SECRET                    Encrypted   Production   
JWT_EXPIRES_IN                Encrypted   Production   
NODE_ENV                      Encrypted   Production   
CORS_ORIGIN                   Encrypted   Production   
NEXT_PUBLIC_API_URL           Encrypted   Production   
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY   Encrypted   Production   
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  Encrypted   Production   
```

### The function IS being found
The header `x-matched-path: /_svc/backend/index` confirms Vercel routes the request to the backend service and finds the serverless function at `api/index.ts`.

### The function starts but crashes
Pino logs at level 30 (info) appear in runtime logs, meaning the Express app's request logging middleware does fire. The crash happens during or after `createApp()` when `parseEnv()` validates environment variables.

---

## 3. What We've Tried

### 3a. Set env vars via CLI (✅ Done, ❌ Didn't fix)
```bash
vercel env add DATABASE_URL production --scope crodacroda --force
# ... repeated for all 12 vars
```
All accepted. Confirmed with `vercel env ls`.

### 3b. Fixed quoted DATABASE_URL and DIRECT_URL (✅ Done, ❌ Didn't fix)
Initial `vercel env add` showed warning: `Value includes surrounding quotes (these will be stripped)`. Re-set both without quotes. Values went from 151→149 chars and 120→118 chars.

### 3c. Triggered CLI deployment (✅ Done, ❌ Didn't fix)
Ran `vercel --prod --scope crodacroda --yes`. Deploy succeeded (state READY), but backend still 500.

### 3d. Pushed to GitHub for Git-triggered deploy (✅ Done, ❌ Didn't fix)
Pushed a commit so Vercel would auto-deploy from GitHub (which should definitely pick up env vars). Deploy succeeded, backend still 500.

### 3e. Verified deployment is latest
Confirmed via `vercel-list_deployments` that the latest deploy (`dpl_AMGTwz...` from FINALREPORT push) is the current production deployment.

---

## 4. What We Think the Problem Is

### Theory 1: Env vars not reaching the backend service function (MOST LIKELY)
In Vercel Services mode, env vars are set at the **project** level. But the backend runs as a serverless function via `@vercel/node` builder (specified in `backend/vercel.json` `builds` array). It's possible that:
- Project-level env vars are injected into Next.js server-side code (frontend service) but NOT into `@vercel/node` functions in the backend service
- The `builds` array creates a separate function bundle that doesn't inherit project env vars
- Services mode might require env vars to be configured differently per service

### Theory 2: `builds`/`routes` keys conflict with Services mode
The `backend/vercel.json` uses legacy `builds` and `routes` keys:
```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.ts" }]
}
```
In Services mode, Vercel auto-detects framework and build configuration. The `builds`/`routes` keys may be ignored or may interfere. The build log shows Vercel ran `npm run build` (not `npm run vercel-build`), suggesting `buildCommand` from `backend/vercel.json` was overridden.

### Theory 3: Missing `"framework": "express"` on backend service
The root `vercel.json` sets `"framework": "nextjs"` on the frontend but has no `framework` on backend:
```json
"backend": {
  "entrypoint": "backend",
  "routePrefix": "/_/backend"
}
```
The Vercel Services docs say `framework` is optional and auto-detected, but adding `"framework": "express"` might fix the build/runtime configuration.

### Theory 4: Zod validation edge case
The `JWT_SECRET` is exactly 32 chars (the minimum in production). The Zod `.refine()` uses `val.length >= 32` which should pass at 32. But if there's a trailing newline from `vercel env add`, it might be 33 chars with a `\n` which would pass validation but could cause issues elsewhere. Or the opposite — if the newline is stripped, it could be 31.

---

## 5. Suggested Fixes to Try

### Fix A: Simplify `backend/vercel.json` for Services mode
Remove `builds` and `routes` (legacy keys). Keep only build configuration:
```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install",
  "framework": "express"
}
```

### Fix B: Add `"framework": "express"` to root vercel.json
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
      "routePrefix": "/_/backend",
      "framework": "express"
    }
  }
}
```

### Fix C: Add a diagnostic endpoint to isolate env vs code
Add a minimal test to `backend/api/index.ts` that returns before `createApp()`:
```typescript
// TEMPORARY: bypass createApp to test if env vars exist
if (process.env.VERCEL_ENV) {
  const handler = (req, res) => {
    res.json({
      hasDbUrl: !!process.env.DATABASE_URL,
      hasJwt: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      envKeys: Object.keys(process.env).filter(k => !k.startsWith('_')).sort()
    });
  };
  export default handler;
}
```
This would tell us definitively whether env vars are present in the function runtime.

### Fix D: Check env vars from Vercel's perspective
```bash
vercel env pull .env.vercel-check --scope crodacroda
cat .env.vercel-check
```
This downloads the actual env var values from Vercel so you can inspect them for format issues (quotes, whitespace, truncation).

### Fix E: Set env vars for "Preview" + "Development" too
Currently env vars are set for "Production" only. Try setting for all environments:
```bash
vercel env add DATABASE_URL production preview development --scope crodacroda --force
```

---

## 6. What HAS Worked

| Component | Status |
|-----------|--------|
| Frontend (Next.js) renders at `/` | ✅ HTTP 200 |
| Vercel project builds successfully | ✅ State: READY |
| Git integration auto-deploys on push | ✅ 4 deployments triggered |
| `vercel env ls` shows all vars | ✅ 12 vars confirmed |
| Backend routes correctly matched | ✅ `x-matched-path: /_svc/backend/index` |
| Backend function invocation | ❌ Crashes at env validation |
| Any backend API call | ❌ 500 on all endpoints |

---

## 7. Deployment History

| Deployment | Trigger | Commit | Result |
|-----------|---------|--------|--------|
| `dpl_FcM4Ae...` | GitHub push | `6c493f4` vercel.json | FE ✅ BE ❌ (no env vars yet) |
| `dpl_D1WgDr...` | CLI `vercel --prod` | `6c493f4` (dirty) | FE ✅ BE ❌ |
| `dpl_FACFTj...` | GitHub push | `5b31780` gitignore | FE ✅ BE ❌ (env vars set before this) |
| `dpl_AMGTwz...` | GitHub push | `cfc5c11` FINALREPORT | FE ✅ BE ❌ |

---

## 8. Key Files

| File | Purpose |
|------|---------|
| `vercel.json` (root) | Defines Services architecture: frontend at `/`, backend at `/_/backend` |
| `backend/vercel.json` | Backend build config — has `builds`/`routes` that may conflict |
| `backend/api/index.ts` | Serverless entry point: `export default createApp()` |
| `backend/src/config/env.ts` | Zod env validation — the file that throws the error |
| `backend/src/app.ts` | Express app factory — middleware chain |
| `frontend/vercel.json` | Frontend build config (working fine) |

---

## 9. Useful Commands for Debugging

```bash
# Check current env vars
vercel env ls production --scope crodacroda

# Pull env vars to local file for inspection
vercel env pull .env.vercel-check --scope crodacroda

# Check runtime logs (look for full error message)
# Vercel Dashboard → actor-v4 → Logs → filter: backend, level: error

# Re-set an env var
echo "value" | vercel env add KEY production --scope crodacroda --force

# Trigger a redeploy after env changes
vercel --prod --scope crodacroda --yes

# Or push an empty commit to trigger GitHub deploy
git commit --allow-empty -m "chore: trigger redeploy" && git push
```
