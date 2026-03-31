# Wave 1: Ship Safe — Technical Documentation

> **Branch:** `feat/wave-1-ship-safe` | **Commits:** 4 | **Files:** 39 | **Lines:** +19,062 / -108

Production-ready security, performance, and cost controls. Non-negotiable before any launch.

---

## Table of Contents

1. [Security Hardening](#1-security-hardening)
2. [Performance Optimizations](#2-performance-optimizations)
3. [Cost Controls & Token Management](#3-cost-controls--token-management)
4. [Data Model Changes](#4-data-model-changes)
5. [New Files Reference](#5-new-files-reference)
6. [Verification](#6-verification)

---

## 1. Security Hardening

### 1.1 CSP Enforcement with Per-Request Nonces

**File:** `src/proxy.ts`

The previous CSP was report-only with `'unsafe-inline'` for scripts. Now:

- A cryptographically random nonce (`crypto.randomUUID()`) is generated per request
- The nonce is injected into the CSP header and passed to Server Components via `x-csp-nonce` response header
- **Production:** `Content-Security-Policy` (enforced)
- **Development:** `Content-Security-Policy-Report-Only` (reporting)

```
script-src 'self' 'nonce-{nonce}' 'unsafe-eval' https://vercel.live
```

> `'unsafe-eval'` is retained for Monaco Editor web workers. Removing it requires Monaco's worker-free mode, which degrades IDE features.

**Static API fallback** in `next.config.ts` applies `default-src 'none'` to all `/api/*` routes (which bypass the proxy):

```
default-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

### 1.2 Tiered Rate Limiting

**File:** `src/lib/ratelimit.ts`

Upgraded from a single flat limit (20 req/min) to three tiers:

| Tier       | Scope               | Limit       | Identifier                  |
| ---------- | ------------------- | ----------- | --------------------------- |
| Guest Page | Non-API routes      | 100 req/min | IP address                  |
| API        | All `/api/*` routes | 200 req/min | `x-guest-id` header or IP   |
| Auth       | Auth routes         | 10 req/min  | IP (brute force protection) |

**In-memory fallback:** If Upstash Redis is unavailable (missing env vars, network partition), an in-memory `Map` with 5-minute TTL cleanup takes over. This prevents a Redis outage from taking down all API routes.

The constants are centralized in `src/lib/config.ts`:

```ts
export const RATE_LIMITS = {
  GUEST_PAGE: { requests: 100, window: '1 m' },
  API: { requests: 200, window: '1 m' },
  AUTH: { requests: 10, window: '1 m' },
} as const;
```

### 1.3 Input Validation (Zod)

**File:** `src/lib/validations.ts`

Zod schemas validate all API route inputs. The `validateBody()` helper returns a typed result:

```ts
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; issues: ZodIssue[] };
```

**Routes with Zod validation:**

| Route                  | Schema                    | Validates                                                           |
| ---------------------- | ------------------------- | ------------------------------------------------------------------- |
| `POST /api/ai/chat`    | Inline (UIMessage format) | messages, mode, title, statement, pattern, difficulty               |
| `POST /api/ai/explain` | `explainRequestSchema`    | title, statement, pattern, difficulty                               |
| `POST /api/ai/hint`    | `hintRequestSchema`       | title, statement, pattern, level, mode                              |
| `POST /api/ai/summary` | `summaryRequestSchema`    | title, pattern, finalCode, testResults, hintsUsed, timeSpentSeconds |
| `POST /api/sessions`   | `sessionCreateSchema`     | problemId, mode                                                     |

The chat route uses inline validation instead of Zod because the AI SDK v6 `UIMessage` format (with `parts[]`) doesn't map cleanly to Zod schemas — the messages are passed through to `convertToModelMessages` which has its own internal validation.

---

## 2. Performance Optimizations

### 2.1 Dynamic Imports

Three heavy components are now lazy-loaded:

| Component             | Where Loaded                  | Strategy                      |
| --------------------- | ----------------------------- | ----------------------------- |
| `CodeEditor` (Monaco) | `session/[id]/page.tsx`       | `dynamic()` with `ssr: false` |
| `PatternHeatmap`      | `progress/page.tsx`           | `dynamic()` with `ssr: false` |
| `MarkdownRenderer`    | `StreamedMarkdownMessage.tsx` | `dynamic()`, SSR enabled      |

Skeleton placeholders match the component's layout to minimize CLS (Cumulative Layout Shift).

### 2.2 Bundle Optimization

**File:** `next.config.ts`

```ts
experimental: {
  optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
}
```

This enables tree-shaking for barrel-export packages. Lucide icons and Radix UI components are imported individually at build time, reducing the initial JS bundle.

### 2.3 Production Console Removal

```ts
compiler: {
  removeConsole: process.env.NODE_ENV === 'production'
    ? { exclude: ['error', 'warn'] }
    : false,
}
```

SWC strips `console.log`, `console.debug`, and `console.info` from production bundles. `console.error` and `console.warn` are preserved for error tracking.

---

## 3. Cost Controls & Token Management

### 3.1 Token Budgeting System

**File:** `src/lib/ai/token-counter.ts`

Every AI request checks the guest's token budget before hitting the LLM:

```ts
const budget = await checkTokenBudget(guestId);
if (!budget.allowed) {
  return new Response(/* 429: token_limit_exceeded */);
}
```

**Budgets:**

- FREE tier: 100,000 tokens per session
- PREMIUM tier: 500,000 tokens per session

The `UserProfile` model tracks `tokensUsed` and `tokenLimit`. If no profile exists yet, FREE defaults apply.

### 3.2 Model Tiering

**File:** `src/lib/ai/provider.ts`

Two new functions for tier-based model selection:

```ts
getModelForTier('FREE', 'reasoning'); // → OPENROUTER_MODEL_FREE or fallback
openrouterForTier('PREMIUM', 'summary'); // → ready-to-use model instance
```

**Env var precedence:**

1. `OPENROUTER_MODEL_PREMIUM` / `OPENROUTER_MODEL_FREE` (tier-specific)
2. `AI_MODEL_REASONING` / `AI_MODEL_SUMMARY` (legacy, per-purpose)
3. `x-ai/grok-4.1-fast` (hardcoded fallback matching current setup)

### 3.3 AI Response Caching

**File:** `src/app/api/ai/chat/route.ts`

Redis cache check before hitting the LLM. Cache key is derived from `guestId` + hash of the last user message text. Cache hit returns immediately with `X-Cache: HIT` header.

> Streaming responses are not cached (they can't be — caching requires collecting the full response first). A future enhancement could cache non-streaming responses like problem explanations.

### 3.4 Structured Logging

**File:** `src/lib/log.ts`

JSON-formatted logs for Vercel's log drain:

```json
{
  "timestamp": "2026-03-31T20:10:00.000Z",
  "level": "info",
  "message": "AI chat request",
  "route": "POST /api/ai/chat",
  "guestId": "abc123",
  "model": "x-ai/grok-4.1-fast",
  "mode": "coach",
  "statusCode": 200,
  "latencyMs": 1234
}
```

### 3.5 Admin Metrics Endpoint

**File:** `src/app/api/admin/metrics/route.ts`

`GET /api/admin/metrics` returns:

- Token usage (last 24h): total tokens, active users
- Top 10 users by token consumption
- Session counts by status
- Active session count

Protected by `ADMIN_SECRET` header when the env var is set.

---

## 4. Data Model Changes

### 4.1 New `UserProfile` Model

```prisma
model UserProfile {
  id               String           @id @default(cuid())
  guestId          String           @unique
  userId           String?          @unique
  currentStreak    Int              @default(0)
  longestStreak    Int              @default(0)
  lastActivityAt   DateTime         @default(now())
  streakLastWonAt  DateTime?
  coins            Int              @default(0)
  tier             SubscriptionTier @default(FREE)
  tokenLimit       Int              @default(100000)
  tokensUsed       Int              @default(0)
  theme            ThemePreference  @default(DARK)
  fontSize         EditorFontSize   @default(MEDIUM)
  keybindingScheme KeybindingScheme @default(VSCODE)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}
```

Supports future gamification (streaks, coins), personalization (theme, font, keybindings), and cost control (tier, token limits).

### 4.2 New Enums

| Enum               | Values                   | Purpose         |
| ------------------ | ------------------------ | --------------- |
| `SubscriptionTier` | FREE, PREMIUM            | Model tiering   |
| `ThemePreference`  | DARK, LIGHT, SYSTEM      | User preference |
| `EditorFontSize`   | SMALL, MEDIUM, LARGE     | User preference |
| `KeybindingScheme` | VSCODE, VIM, EMACS, NONE | User preference |

### 4.3 Problem Model Extensions

- `isCurated Boolean @default(false)` — curated problem flag
- `curatedOrder Int?` — ordering for curated lists
- `dailyChallengeDate DateTime?` — daily challenge scheduling

### 4.4 Performance Indexes

| Model            | Index                                      | Query Optimized        |
| ---------------- | ------------------------------------------ | ---------------------- |
| Problem          | `@@index([difficulty, pattern])`           | Filtered problem lists |
| Problem          | `@@index([createdAt])`                     | Chronological sorting  |
| Problem          | `@@index([isCurated, curatedOrder])`       | Curated list ordering  |
| UserProblemState | `@@index([lastAttemptedAt, nextReviewAt])` | Review scheduling      |

---

## 5. New Files Reference

| File                                 | Purpose                                                              |
| ------------------------------------ | -------------------------------------------------------------------- |
| `src/lib/config.ts`                  | Centralized constants (rate limits, models, cache TTLs, CSP origins) |
| `src/lib/validations.ts`             | Zod schemas for all API route inputs                                 |
| `src/lib/log.ts`                     | Structured JSON logging                                              |
| `src/lib/ai/token-counter.ts`        | Token budget checking and usage recording                            |
| `src/app/api/admin/metrics/route.ts` | Admin metrics endpoint                                               |

---

## 6. Verification

### Automated

```bash
bun run type-check   # PASS — 0 errors
bun run test         # PASS — 197/197 tests
bun run build        # PASS — 37 static pages, 4.2s
```

### Manual Verification

- [ ] Visit `/practice` — problem list loads with cache headers
- [ ] Start a session — CodeEditor loads with skeleton, then Monaco
- [ ] Send a chat message — AI responds, token budget checked
- [ ] Visit `/progress` — PatternHeatmap loads dynamically
- [ ] Check browser devtools — no CSP violations in production mode
- [ ] Check response headers — `Content-Security-Policy` present in prod
- [ ] Hit `/api/admin/metrics` — returns JSON (or 401 without secret)

### Remaining (not blocking)

- `prisma migrate dev` — interactive migration file creation (currently synced via `db push`)
- `bun audit` — 3 HIGH vulnerabilities in prisma transitive deps (upstream, awaiting prisma update)
- Bundle profiling — run `next build --profile` to measure actual sizes
