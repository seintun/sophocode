# Patrncode MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build patrnco.de — an AI-coached coding interview practice platform that teaches DSA through pattern-based learning, progressive hints, and process-first sessions (Clarify → Plan → Code → Reflect).

**Architecture:** Monolithic Next.js 15 app (App Router) with Supabase Postgres via Prisma ORM, guest-first anonymous sessions (auth added later), Pyodide (WASM) for browser-side Python execution, and Vercel AI SDK streaming over OpenRouter for AI coaching. Three-panel session layout: problem | editor | coaching chat.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Monaco Editor, Supabase Postgres + Prisma ORM, Pyodide (WASM Python), Vercel AI SDK + OpenRouter, Vitest, Playwright

---

## Context

**Problem:** Current interview prep tools (LeetCode, HackerRank) emphasize rote grinding with binary pass/fail feedback. Users — especially beginners, career switchers, and rusty engineers — lack intuitive complexity teaching, progressive coaching, and process-oriented practice.

**Solution:** patrncode provides an AI coach inside a focused coding environment. It teaches patterns (not just problems), explains Big-O intuitively, offers 3-level progressive hints, and guides users through a structured interview process. Three session modes: Self-Practice, Coach Me, Mock Interview.

**Source docs:** All in `/Users/seintun/Documents/Obsidian Vault/1-Projects/Side Projects/AI Interview Playground/`:

- `prd.md` — Feature pillars and functional requirements
- `tech-decisions.md` — Architecture rationale
- `design-ux.md` — Layout, components, typography, accessibility
- `user-stories.md` — User flows per feature area
- `market-research.md` — Competitive analysis and differentiation
- Master Documentation — Strategic blueprint, 60-30-10 color system

**Key decisions made:**

- **Guest mode first** — anonymous sessions via `guestId` (localStorage), Supabase Auth added in Phase 7
- **Normalized data model** — separate TestCase, Hint, TestRun, SessionFeedback tables
- **Dark mode first** (60-30-10: Deep Ink #0F172A / Slate #1E293B / Electric Cyan #22D3EE)
- **Pyodide** for MVP code execution (upgrade to server-side sandbox post-MVP)
- **Supabase** for Postgres hosting (auth added later)
- **Vercel AI SDK** as streaming abstraction over OpenRouter
- **Bun** as package manager (per user conventions)

---

## File Structure

```
patrncode/
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout + providers
│   │   ├── page.tsx                        # Landing / redirect to practice
│   │   ├── globals.css                     # Tailwind v4 theme tokens
│   │   ├── onboarding/page.tsx             # First-run onboarding
│   │   ├── practice/
│   │   │   ├── page.tsx                    # Problem list
│   │   │   └── [slug]/page.tsx             # Problem detail / pre-session
│   │   ├── session/
│   │   │   ├── [id]/page.tsx               # Three-panel session view
│   │   │   └── [id]/summary/page.tsx       # Post-session summary
│   │   ├── progress/page.tsx               # Progress & analytics
│   │   ├── api/
│   │   │   ├── problems/
│   │   │   │   ├── route.ts                # GET: list problems
│   │   │   │   └── [slug]/route.ts         # GET: problem detail
│   │   │   ├── sessions/
│   │   │   │   ├── route.ts                # POST: create session
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts            # GET/PATCH: session CRUD
│   │   │   │       ├── snapshot/route.ts   # PATCH: save code snapshot
│   │   │   │       └── hints/route.ts      # POST: save hint record
│   │   │   ├── runs/route.ts               # POST: save test run
│   │   │   ├── ai/
│   │   │   │   ├── explain/route.ts        # POST: stream explanation
│   │   │   │   ├── hint/route.ts           # POST: stream hint
│   │   │   │   ├── chat/route.ts           # POST: stream coaching chat
│   │   │   │   └── summary/route.ts        # POST: stream session summary
│   │   │   └── progress/route.ts           # GET: user progress data
│   │   └── (auth)/                         # Added in Phase 7
│   │       ├── login/page.tsx
│   │       └── callback/route.ts
│   ├── components/
│   │   ├── ui/                             # Button, Badge, Card, Input, Select, Skeleton
│   │   └── domain/
│   │       ├── ProblemList.tsx
│   │       ├── ProblemPanel.tsx
│   │       ├── CodeEditor.tsx
│   │       ├── CoachingPanel.tsx
│   │       ├── TestResults.tsx
│   │       ├── SessionLayout.tsx
│   │       └── PatternHeatmap.tsx
│   ├── lib/
│   │   ├── guest.ts                        # Guest ID management (localStorage)
│   │   ├── db/
│   │   │   └── prisma.ts                   # Prisma client singleton
│   │   ├── ai/
│   │   │   ├── provider.ts                 # OpenRouter via AI SDK
│   │   │   ├── models.ts                   # Model config
│   │   │   └── prompts/
│   │   │       ├── explanation.ts
│   │   │       ├── hint.ts
│   │   │       ├── coach.ts
│   │   │       ├── interviewer.ts
│   │   │       └── summary.ts
│   │   ├── execution/
│   │   │   ├── pyodide-worker.ts           # Web Worker for Pyodide
│   │   │   └── runner.ts                   # Execution interface
│   │   ├── mastery.ts                      # State machine + spaced repetition
│   │   └── utils.ts                        # cn() helper
│   ├── hooks/
│   │   ├── useGuestId.ts                   # Guest ID hook
│   │   ├── useCodeExecution.ts
│   │   ├── useSession.ts
│   │   └── useAIChat.ts
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   └── e2e/
├── public/
└── [config files]
```

---

## Phase 0: Project Scaffolding & Tooling

**Goal:** Empty directory → running, linted, tested Next.js app with full dev tooling.

### Task 0.1: Initialize Git + Next.js

- [ ] **Step 1:** Initialize git repo

```bash
cd /Users/seintun/code/projects/patrncode
git init
```

- [ ] **Step 2:** Scaffold Next.js with bun

```bash
bunx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Select: App Router yes, Turbopack yes, customize import alias no

- [ ] **Step 3:** Verify dev server runs

```bash
bun dev
```

Expected: Next.js starter page at localhost:3000

- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "chore: scaffold next.js 15 app with typescript and tailwind"
```

### Task 0.2: Tailwind v4 Dark Theme Tokens

- [ ] **Step 1:** Configure design tokens in `src/app/globals.css`

```css
@import 'tailwindcss';

@theme {
  /* 60-30-10 Dark System */
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-elevated: #334155;
  --color-bg-editor: #0f172a;

  /* Accent */
  --color-accent: #22d3ee;
  --color-accent-hover: #06b6d4;
  --color-ai-coach: #818cf8;

  /* Feedback */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-error-soft: #fda4af;

  /* Big-O Traffic Light */
  --color-bigo-green: #10b981;
  --color-bigo-yellow: #f59e0b;
  --color-bigo-red: #ef4444;

  /* Text */
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;

  /* Borders */
  --color-border: #334155;
  --color-border-subtle: #1e293b;
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}
```

- [ ] **Step 2:** Commit

```bash
git add -A && git commit -m "feat: configure tailwind v4 dark theme tokens (60-30-10)"
```

### Task 0.3: Code Quality Tooling

- [ ] **Step 1:** Install dev dependencies

```bash
bun add -d prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
```

- [ ] **Step 2:** Create `.prettierrc.json`

```json
{ "semi": true, "singleQuote": true, "trailingComma": "all", "printWidth": 100 }
```

- [ ] **Step 3:** Create `commitlint.config.cjs`

```js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

- [ ] **Step 4:** Configure husky + lint-staged

```bash
bunx husky init
echo 'bun run lint-staged' > .husky/pre-commit
echo 'bunx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

- [ ] **Step 5:** Add lint-staged config and scripts to `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  },
  "scripts": {
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

- [ ] **Step 6:** Commit

```bash
git add -A && git commit -m "chore: add prettier, husky, lint-staged, commitlint"
```

### Task 0.4: Testing Setup

- [ ] **Step 1:** Install Vitest + Playwright

```bash
bun add -d vitest @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom @vitest/coverage-v8 @playwright/test
bunx playwright install chromium
```

- [ ] **Step 2:** Create `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 3:** Create `src/test-setup.ts`

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4:** Add test scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 5:** Verify `bun test` exits cleanly, commit

```bash
git add -A && git commit -m "chore: add vitest and playwright testing setup"
```

### Task 0.5: GitHub Repo + Utilities

- [ ] **Step 1:** Install utility packages and create `src/lib/utils.ts`

```bash
bun add clsx tailwind-merge
```

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2:** Create repo and push

```bash
gh repo create patrncode --private --source=. --push
```

- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "chore: add cn utility and push to github"
git push
```

---

## Phase 1: Database Schema & Seed Data

**Goal:** Normalized Prisma schema deployed to Supabase Postgres, seed data loaded. No auth — sessions use anonymous `guestId`.

**Files:**

- Create: `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/db/prisma.ts`, `src/lib/guest.ts`, `src/hooks/useGuestId.ts`

### Task 1.1: Supabase Postgres + Prisma Setup

- [ ] **Step 1:** Create Supabase project at supabase.com and get Postgres connection strings

- [ ] **Step 2:** Install Prisma

```bash
bun add prisma @prisma/client
bunx prisma init
```

- [ ] **Step 3:** Create `.env.local` (gitignored)

```
DATABASE_URL=<supabase-pooled-connection-string>
DIRECT_URL=<supabase-direct-connection-string>
```

- [ ] **Step 4:** Create `src/lib/db/prisma.ts` — singleton pattern for dev hot-reload

- [ ] **Step 5:** Commit

```bash
git add -A && git commit -m "chore: configure prisma with supabase postgres"
```

### Task 1.2: Prisma Schema (Normalized)

- [ ] **Step 1:** Write `prisma/schema.prisma` with all models:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Problem {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  difficulty  Difficulty
  pattern     Pattern
  tags        String[]
  constraints String[]
  sourceType  SourceType @default(INTERNAL)
  externalUrl String?
  statement   String
  examples    Json       // [{input, output, explanation}]
  starterCode String     @default("")
  approaches  Json?      // [{name, description, complexity}]
  sortOrder   Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  testCases TestCase[]
  sessions  Session[]
}

model TestCase {
  id        String  @id @default(cuid())
  problemId String
  input     String
  expected  String
  isHidden  Boolean @default(false)
  order     Int

  problem Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
}

model Session {
  id        String        @id @default(cuid())
  guestId   String        // Anonymous session token (localStorage)
  userId    String?       // Linked after auth migration (Phase 7)
  problemId String
  mode      SessionMode
  status    SessionStatus @default(IN_PROGRESS)
  code      String?       // Latest code snapshot
  startedAt   DateTime    @default(now())
  completedAt DateTime?
  outcome     SessionOutcome?

  problem  Problem          @relation(fields: [problemId], references: [id])
  runs     TestRun[]
  hints    Hint[]
  feedback SessionFeedback?
  messages SessionMessage[]
}

model TestRun {
  id        String   @id @default(cuid())
  sessionId String
  code      String
  results   Json     // [{input, expected, actual, passed, error}]
  passed    Int
  total     Int
  createdAt DateTime @default(now())

  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

model Hint {
  id        String   @id @default(cuid())
  sessionId String
  level     Int      // 1, 2, or 3
  content   String   // LLM-generated hint text
  createdAt DateTime @default(now())

  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

model SessionFeedback {
  id             String @id @default(cuid())
  sessionId      String @unique
  strengths      String
  weaknesses     String
  suggestions    String
  complexityNote String

  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

model SessionMessage {
  id        String      @id @default(cuid())
  sessionId String
  role      MessageRole
  content   String
  metadata  Json?
  createdAt DateTime    @default(now())

  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

model UserProblemState {
  id              String       @id @default(cuid())
  guestId         String
  userId          String?      // Linked after auth migration
  problemId       String
  mastery         MasteryState @default(UNSEEN)
  lastAttemptedAt DateTime?
  nextReviewAt    DateTime?
  attemptCount    Int          @default(0)
  solveCount      Int          @default(0)

  @@unique([guestId, problemId])
}

// Enums
enum Difficulty     { EASY MEDIUM HARD }
enum Pattern        { ARRAYS_STRINGS HASH_MAPS TWO_POINTERS SLIDING_WINDOW BINARY_SEARCH LINKED_LISTS STACKS_QUEUES TREES GRAPHS RECURSION_BACKTRACKING DYNAMIC_PROGRAMMING HEAPS SORTING GREEDY }
enum SourceType     { INTERNAL EXTERNAL }
enum SessionMode    { SELF_PRACTICE COACH_ME MOCK_INTERVIEW }
enum SessionStatus  { IN_PROGRESS COMPLETED ABANDONED }
enum SessionOutcome { SOLVED PARTIALLY_SOLVED NOT_SOLVED }
enum MasteryState   { UNSEEN IN_PROGRESS MASTERED NEEDS_REFRESH }
enum MessageRole    { USER ASSISTANT SYSTEM }
```

- [ ] **Step 2:** Run initial migration

```bash
bunx prisma migrate dev --name init
```

- [ ] **Step 3:** Verify schema in Supabase dashboard SQL editor

- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "feat: define normalized prisma schema with all mvp models"
```

### Task 1.3: Guest ID System

- [ ] **Step 1:** Create `src/lib/guest.ts`

```ts
import { v4 as uuidv4 } from 'uuid';

const GUEST_ID_KEY = 'patrncode_guest_id';

export function getGuestId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}
```

- [ ] **Step 2:** Install uuid: `bun add uuid && bun add -d @types/uuid`

- [ ] **Step 3:** Create `src/hooks/useGuestId.ts` — React hook wrapping `getGuestId()` (handles SSR safely with `useState` + `useEffect`)

- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "feat: add guest id system with localstorage persistence"
```

### Task 1.4: Seed Problems

- [ ] **Step 1:** Create `prisma/seed.ts` with 8 starter problems across 4 patterns:

| #   | Problem                                        | Pattern        | Difficulty |
| --- | ---------------------------------------------- | -------------- | ---------- |
| 1   | Two Sum                                        | HASH_MAPS      | EASY       |
| 2   | Valid Anagram                                  | HASH_MAPS      | EASY       |
| 3   | Group Anagrams                                 | HASH_MAPS      | MEDIUM     |
| 4   | Best Time to Buy and Sell Stock                | ARRAYS_STRINGS | EASY       |
| 5   | Maximum Subarray                               | ARRAYS_STRINGS | MEDIUM     |
| 6   | Valid Palindrome                               | TWO_POINTERS   | EASY       |
| 7   | Binary Search                                  | BINARY_SEARCH  | EASY       |
| 8   | Longest Substring Without Repeating Characters | SLIDING_WINDOW | MEDIUM     |

Each problem includes: title, slug, difficulty, pattern, statement (markdown), examples (JSON), constraints, starterCode (function signature), and 5-8 TestCase records (2-3 visible + hidden).

- [ ] **Step 2:** Add seed script to `package.json`

```json
{ "prisma": { "seed": "bun prisma/seed.ts" } }
```

- [ ] **Step 3:** Run seed and verify

```bash
bunx prisma db seed
```

- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "feat: seed 8 starter problems with test cases"
```

---

## Phase 2: Problem Browsing & App Shell

**Goal:** Users can browse problems, filter by pattern/difficulty, and select one. No auth required.

**Files:**

- Create: `src/components/ui/{Button,Badge,Card,Input,Skeleton}.tsx`, `src/app/layout.tsx` (rewrite), `src/app/practice/page.tsx`, `src/app/practice/[slug]/page.tsx`, `src/components/domain/ProblemList.tsx`, `src/app/api/problems/route.ts`, `src/app/api/problems/[slug]/route.ts`

### Task 2.1: UI Primitives

- [ ] **Step 1:** Create `Button` (primary/secondary/ghost), `Badge` (difficulty/pattern/mastery), `Card`, `Input`, `Select`, `Skeleton` in `src/components/ui/`
- [ ] **Step 2:** Test: Render each component, verify className output
- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "feat: add ui primitives (button, badge, card, input, skeleton)"
```

### Task 2.2: App Shell Layout

- [ ] **Step 1:** Rewrite `src/app/layout.tsx` with:
  - Top nav: Logo "patrncode" (left), nav links Practice/Progress (center), guest avatar (right)
  - Dark bg (`--color-bg-primary`), nav bar uses `--color-bg-secondary`
  - Active link highlighted with `--color-accent`
  - Fonts: Inter (sans) via `next/font/google`, JetBrains Mono (code)
- [ ] **Step 2:** `src/app/page.tsx` — redirect to `/practice` (landing page added in Phase 7)
- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "feat: add app shell layout with dark nav"
```

### Task 2.3: Problem List API + Page

- [ ] **Step 1:** Create `src/app/api/problems/route.ts` — GET with query params: `pattern`, `difficulty`, `search`
- [ ] **Step 2:** Create `src/components/domain/ProblemList.tsx` (Client Component):
  - Filter bar: Pattern dropdown, Difficulty checkboxes, Search input
  - Problem rows: title, difficulty badge, pattern badge, mastery badge (from guestId), attempt count
  - Sort by difficulty or pattern
- [ ] **Step 3:** Create `src/app/practice/page.tsx` — Server Component fetching problems, renders `ProblemList`
- [ ] **Step 4:** Test: Filter by pattern, verify correct problems shown
- [ ] **Step 5:** Commit

```bash
git add -A && git commit -m "feat: add problem list page with filtering"
```

### Task 2.4: Problem Detail / Pre-Session Page

- [ ] **Step 1:** Create `src/app/api/problems/[slug]/route.ts` — GET single problem with test cases (visible only)
- [ ] **Step 2:** Install markdown renderer: `bun add react-markdown remark-gfm`
- [ ] **Step 3:** Create `src/app/practice/[slug]/page.tsx`:
  - Full problem statement (rendered markdown)
  - Examples with formatted I/O
  - Constraints list
  - Mode selector: Self-Practice / Coach Me / Mock Interview
  - "Start Session" button → creates session → navigates to `/session/[id]`
- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "feat: add problem detail page with mode selection"
```

---

## Phase 3: Session View & Code Editor

**Goal:** Three-panel session layout with Monaco Editor, Pyodide execution, and test results.

**Files:**

- Create: `src/app/session/[id]/page.tsx`, `src/components/domain/{SessionLayout,CodeEditor,ProblemPanel,CoachingPanel,TestResults}.tsx`, `src/lib/execution/{pyodide-worker,runner}.ts`, `src/hooks/{useCodeExecution,useSession}.ts`, `src/app/api/sessions/route.ts`, `src/app/api/sessions/[id]/route.ts`, `src/app/api/runs/route.ts`

### Task 3.1: Session API

- [ ] **Step 1:** Create `src/app/api/sessions/route.ts` — POST: create session (guestId + problemId + mode → returns session id)
- [ ] **Step 2:** Create `src/app/api/sessions/[id]/route.ts` — GET session with problem + test cases, PATCH to update code/status
- [ ] **Step 3:** Create `src/app/api/runs/route.ts` — POST: persist TestRun results after client-side execution
- [ ] **Step 4:** Test: Create session via API, verify DB record
- [ ] **Step 5:** Commit

```bash
git add -A && git commit -m "feat: add session and test run api routes"
```

### Task 3.2: Three-Panel Layout

- [ ] **Step 1:** Create `src/components/domain/SessionLayout.tsx` — CSS Grid with 3 resizable columns (30% | 40% | 30%)
  - Collapse to tabbed layout below 768px breakpoint
- [ ] **Step 2:** Create `src/app/session/[id]/page.tsx` — loads session data, renders SessionLayout
- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "feat: add three-panel session layout"
```

### Task 3.3: Monaco Editor

- [ ] **Step 1:** Install Monaco: `bun add @monaco-editor/react`
- [ ] **Step 2:** Create `src/components/domain/CodeEditor.tsx`:
  - Dynamic import with `next/dynamic` (`ssr: false`) + loading skeleton
  - Python language mode
  - Custom dark theme matching design palette
  - Controlled value with debounced onChange (500ms auto-save)
  - Starter code loaded from problem
  - Font: JetBrains Mono
- [ ] **Step 3:** Wire editor value to `useSession` hook
- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "feat: integrate monaco editor with python support"
```

### Task 3.4: Pyodide Code Execution

- [ ] **Step 1:** Create `src/lib/execution/pyodide-worker.ts` — Web Worker that:
  - Loads Pyodide from CDN (lazy, cached after first load — ~20MB)
  - Accepts `{ code, testCases }` messages
  - Runs user code + test harness per test case
  - Captures stdout via `io.StringIO` redirect
  - Returns `{ results: [{ passed, input, expected, actual, error? }] }`
  - Enforces 5s timeout per test case via JS-side `setTimeout` + `worker.terminate`
  - Hidden test cases: run but only report pass/fail count, not input/output
- [ ] **Step 2:** Create `src/lib/execution/runner.ts` — clean interface wrapping the worker
- [ ] **Step 3:** Create `src/hooks/useCodeExecution.ts` — React hook: `{ run, results, isRunning, error }`
- [ ] **Step 4:** Test: Execute simple Python function against test cases
- [ ] **Step 5:** Commit

```bash
git add -A && git commit -m "feat: add pyodide web worker for python execution"
```

### Task 3.5: Problem Panel + Test Results

- [ ] **Step 1:** Create `src/components/domain/ProblemPanel.tsx`:
  - Tabs: Statement | Examples | Notes
  - Markdown rendering for statement
  - Examples with code-formatted I/O
  - Constraints list
  - User notes textarea (saved to session)
- [ ] **Step 2:** Create `src/components/domain/TestResults.tsx`:
  - Shows below editor in I/O panel
  - Per-test: pass (green ✓) / fail (red ✗) with input, expected, actual
  - Hidden tests: show count only ("2/3 hidden tests passed")
  - Error messages for runtime errors
  - Summary: "5/8 tests passed"
  - "Why did this fail?" button → triggers AI feedback (wired in Phase 4)
- [ ] **Step 3:** Wire "Run" button → `useCodeExecution` → save TestRun via `/api/runs` → render `TestResults`
- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "feat: add problem panel and test results display"
```

### Task 3.6: Coaching Panel (Static Shell)

- [ ] **Step 1:** Create `src/components/domain/CoachingPanel.tsx`:
  - Chat-style UI with message bubbles (AI uses `--color-ai-coach` tint)
  - "Get Hint" button with level indicator (Level 1/2/3)
  - Mode badge at top (Self-Practice / Coach Me / Mock Interview)
  - Chat input (disabled until Phase 4)
  - Static placeholder: "AI coaching will appear here"
- [ ] **Step 2:** Commit

```bash
git add -A && git commit -m "feat: add coaching panel shell (static placeholder)"
```

### Task 3.7: Session State Management

- [ ] **Step 1:** Create `src/hooks/useSession.ts`:
  - Manages: current code, test results, hints used, session timer
  - Auto-saves code snapshot every 30s via PATCH `/api/sessions/[id]`
  - Tracks time spent in session
- [ ] **Step 2:** Commit

```bash
git add -A && git commit -m "feat: add session state management with auto-save"
```

---

## Phase 4: AI Integration — Hints, Explanations, Coaching

**Goal:** Wire up the AI coaching layer — the core differentiator.

**Files:**

- Create: `src/lib/ai/{provider,models}.ts`, `src/lib/ai/prompts/{explanation,hint,coach,interviewer,summary}.ts`, `src/app/api/ai/{explain,hint,chat,summary}/route.ts`, `src/app/api/sessions/[id]/hints/route.ts`, `src/hooks/useAIChat.ts`
- Modify: `src/components/domain/CoachingPanel.tsx`, `src/components/domain/ProblemPanel.tsx`

### Task 4.1: AI Infrastructure

- [ ] **Step 1:** Install Vercel AI SDK

```bash
bun add ai @ai-sdk/openai
```

- [ ] **Step 2:** Add to `.env.local`

```
OPENROUTER_API_KEY=<key>
```

- [ ] **Step 3:** Create `src/lib/ai/provider.ts`

```ts
import { createOpenAI } from '@ai-sdk/openai';
export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});
```

- [ ] **Step 4:** Create `src/lib/ai/models.ts`

```ts
export const MODELS = {
  reasoning: 'anthropic/claude-sonnet-4',
  summary: 'openai/gpt-4o-mini',
} as const;
```

- [ ] **Step 5:** Commit

```bash
git add -A && git commit -m "feat: configure vercel ai sdk with openrouter provider"
```

### Task 4.2: Prompt Templates

- [ ] **Step 1:** `explanation.ts` — plain-language restatement, approach overview, intuitive complexity. No full solution code.

- [ ] **Step 2:** `hint.ts` — progressive hints by level:
  - Level 1: Pattern name + high-level intuition
  - Level 2: Approach outline + key data structures
  - Level 3: Pseudocode-style steps (short snippets, no full solution)
  - Context includes: problem, current code, test results

- [ ] **Step 3:** `coach.ts` — Coach Me system prompt: encouraging, hints on demand, celebrates progress, intuitive complexity framing

- [ ] **Step 4:** `interviewer.ts` — Mock Interview: Socratic questioning, asks clarifications, minimal direct hints, evaluates communication

- [ ] **Step 5:** `summary.ts` — post-session: strengths, weaknesses, suggestions, complexity note of final solution

- [ ] **Step 6:** Test: Prompt functions produce correct structure, no solution leaks at level 1-2
- [ ] **Step 7:** Commit

```bash
git add -A && git commit -m "feat: add ai prompt templates for all session modes"
```

### Task 4.3: Streaming API Routes + Hint Persistence

- [ ] **Step 1:** `src/app/api/ai/explain/route.ts` — POST: streams explanation via `streamText()`
- [ ] **Step 2:** `src/app/api/ai/hint/route.ts` — POST: streams hint, validates level progression (can't skip to 3)
- [ ] **Step 3:** `src/app/api/ai/chat/route.ts` — POST: streams coaching chat with mode-specific system prompt
- [ ] **Step 4:** `src/app/api/ai/summary/route.ts` — POST: streams session summary using cheaper model
- [ ] **Step 5:** `src/app/api/sessions/[id]/hints/route.ts` — POST: persist Hint record after AI generates it
- [ ] **Step 6:** Commit

```bash
git add -A && git commit -m "feat: add streaming ai routes with hint persistence"
```

### Task 4.4: Wire AI to UI

- [ ] **Step 1:** Create `src/hooks/useAIChat.ts` — wraps Vercel AI SDK `useChat` with patrncode config

- [ ] **Step 2:** Update `ProblemPanel.tsx` — add "Explanation" tab that streams AI explanation on session start (Coach Me / Self-Practice). Hidden in Mock Interview.

- [ ] **Step 3:** Update `CoachingPanel.tsx` — wire to live AI:
  - Chat messages stream in real-time (Digital Lavender #818CF8 for AI bubbles)
  - "Get Hint" button → `/api/ai/hint` with current code + test results → save Hint record
  - "Why did this fail?" button appears after failed test runs
  - Mode-specific: Self-Practice (hints only), Coach Me (full chat), Mock Interview (Socratic)

- [ ] **Step 4:** E2E: Start Coach Me session, run tests, request hint, verify streamed response

- [ ] **Step 5:** Commit

```bash
git add -A && git commit -m "feat: wire ai coaching to session ui with streaming"
```

---

## Phase 5: Session Completion & Progress Tracking

**Goal:** Close the learning loop — summaries, mastery tracking, dashboard, analytics.

**Files:**

- Create: `src/app/session/[id]/summary/page.tsx`, `src/lib/mastery.ts`, `src/app/page.tsx` (rewrite as dashboard), `src/app/progress/page.tsx`, `src/components/domain/PatternHeatmap.tsx`, `src/app/api/progress/route.ts`

### Task 5.1: Mastery State Machine

- [ ] **Step 1:** Write failing tests for mastery transitions:
  - UNSEEN → IN_PROGRESS (first attempt)
  - IN_PROGRESS → MASTERED (solved with ≤1 hint)
  - IN_PROGRESS → IN_PROGRESS (failed or heavy hints)
  - MASTERED → NEEDS_REFRESH (7+ days since last solve)
  - NEEDS_REFRESH → MASTERED (re-solved)
- [ ] **Step 2:** Create `src/lib/mastery.ts` with `computeNextMastery()` and `computeNextReviewDate()`
- [ ] **Step 3:** Run tests, verify all pass
- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "feat: add mastery state machine with spaced repetition"
```

### Task 5.2: Session Completion Flow

- [ ] **Step 1:** Add "End Session" button:
  - Saves final code + TestRun
  - Auto-detects outcome from test results
  - Calls `/api/ai/summary` → save `SessionFeedback` record (structured: strengths, weaknesses, suggestions, complexityNote)
  - Updates `UserProblemState` via mastery state machine
  - Marks Session as COMPLETED
  - Redirects to summary page

- [ ] **Step 2:** Create `src/app/session/[id]/summary/page.tsx`:
  - AI feedback: strengths, weaknesses, suggestions, complexity note (from SessionFeedback)
  - Stats: time spent, hints used (count from Hint records), test pass rate (from TestRun)
  - "Practice Again" / "Next Problem" / "Back to Practice"

- [ ] **Step 3:** E2E: Complete session, verify summary + mastery update
- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "feat: add session completion with ai feedback and mastery"
```

### Task 5.3: Dashboard

- [ ] **Step 1:** Rewrite `src/app/page.tsx` as dashboard:
  - Today's suggestions: problems in NEEDS_REFRESH + recommended next
  - Quick stats: total solved, patterns practiced, sessions this week
  - Recent sessions: last 5 with outcomes
- [ ] **Step 2:** Create `src/app/api/progress/route.ts` — GET: aggregated stats + progress data for guestId
- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "feat: add dashboard with stats and suggestions"
```

### Task 5.4: Progress Page

- [ ] **Step 1:** Create `src/components/domain/PatternHeatmap.tsx` — grid showing mastery per pattern
- [ ] **Step 2:** Create `src/app/progress/page.tsx`:
  - Pattern heatmap
  - Problem history: all attempts with mastery, hint count, last date
  - Difficulty distribution chart
  - "Retest Today" suggestions
- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "feat: add progress page with pattern heatmap"
```

---

## Phase 6: Onboarding & Polish

**Goal:** First-run experience for new visitors, UX polish, keyboard shortcuts.

**Files:**

- Create: `src/app/onboarding/page.tsx`
- Modify: Various components for loading/error/empty states

### Task 6.1: Onboarding Flow

- [ ] **Step 1:** Create `src/app/onboarding/page.tsx` — multi-step flow:
  1. Welcome: "What brings you here?" → experience level selector (New to DSA / Some Experience / Retesting)
  2. What interviews test (brief explainer)
  3. The process: Clarify → Plan → Code → Reflect
  4. Big-O made simple: CSS-animated bar chart showing constant/linear/quadratic growth
  5. "Try your first problem" CTA → redirects to an Easy problem
- [ ] **Step 2:** Store experience level + `onboardingCompleted` in localStorage (guest mode). Skip-able.
- [ ] **Step 3:** First visit to `/` redirects to `/onboarding` if not completed
- [ ] **Step 4:** E2E: Complete full onboarding flow
- [ ] **Step 5:** Commit

```bash
git add -A && git commit -m "feat: add onboarding flow with big-o visualization"
```

### Task 6.2: UX Polish

- [ ] **Step 1:** Add Skeleton loading states to all data-fetching pages
- [ ] **Step 2:** Add error boundaries with retry buttons
- [ ] **Step 3:** Add empty states ("No problems match your filters", "Start your first session")
- [ ] **Step 4:** Degraded mode: if OpenRouter is down, show "AI features temporarily unavailable" banner. Editor + execution still work.
- [ ] **Step 5:** Pyodide loading state: "Preparing Python environment..." on first Run click
- [ ] **Step 6:** Add keyboard shortcuts: Ctrl/Cmd+Enter to run, Ctrl/Cmd+H for hint
- [ ] **Step 7:** Verify responsive behavior: session view collapses to tabs on mobile
- [ ] **Step 8:** Accessibility: focus management, ARIA labels, WCAG AA contrast check
- [ ] **Step 9:** Commit

```bash
git add -A && git commit -m "feat: add loading states, error handling, keyboard shortcuts"
```

---

## Phase 7: Auth, Security & Launch

**Goal:** Add Supabase Auth with guest-to-user migration, landing page, security hardening, deploy.

**Files:**

- Create: `src/app/(auth)/{login/page.tsx,callback/route.ts}`, `src/lib/supabase/{client,server,middleware}.ts`, `src/middleware.ts`, `src/app/(marketing)/{layout,page}.tsx`
- Modify: All API routes to support both guestId and userId

### Task 7.1: Supabase Auth

- [ ] **Step 1:** Install Supabase packages

```bash
bun add @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2:** Add to `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

- [ ] **Step 3:** Create `src/lib/supabase/{client,server,middleware}.ts` — browser + server clients with SSR cookie handling

- [ ] **Step 4:** Create `src/app/(auth)/login/page.tsx` — sign in with GitHub + Google OAuth + email magic link

- [ ] **Step 5:** Create `src/app/(auth)/callback/route.ts` — Supabase auth callback handler

- [ ] **Step 6:** Create `src/middleware.ts` — refresh auth tokens on each request (no route protection — guest mode still works)

- [ ] **Step 7:** Enable GitHub + Google OAuth in Supabase dashboard

- [ ] **Step 8:** Commit

```bash
git add -A && git commit -m "feat: add supabase auth with github and google oauth"
```

### Task 7.2: Guest-to-User Migration

- [ ] **Step 1:** On sign-in, run migration query: update all records matching `guestId` to set `userId` to the authenticated user's ID. Tables: `Session`, `UserProblemState`

- [ ] **Step 2:** Update all API routes to check for authenticated user first, fall back to guestId

- [ ] **Step 3:** Add "Sign in to save progress" prompt in nav for guest users

- [ ] **Step 4:** Update nav: show user avatar + sign out for authenticated users, "Sign in" button for guests

- [ ] **Step 5:** Test: Create sessions as guest → sign in → verify sessions linked to account

- [ ] **Step 6:** Commit

```bash
git add -A && git commit -m "feat: add guest to user migration on sign-in"
```

### Task 7.3: Landing Page

- [ ] **Step 1:** Create `src/app/(marketing)/layout.tsx` — public layout
- [ ] **Step 2:** Create `src/app/(marketing)/page.tsx`:
  - Hero: "Practice coding interviews with an AI coach"
  - Features grid: Progressive Hints, Pattern-Based Learning, Process-First Practice
  - CTA: "Start practicing free" → `/practice` (no sign-up needed!)
- [ ] **Step 3:** Move dashboard to `/dashboard` route, landing page becomes `/`
- [ ] **Step 4:** Add OpenGraph meta tags
- [ ] **Step 5:** Commit

```bash
git add -A && git commit -m "feat: add marketing landing page"
```

### Task 7.4: Security & Performance

- [ ] **Step 1:** Add rate limiting on AI routes (in-memory or `@upstash/ratelimit`)
- [ ] **Step 2:** Add CSP headers in `next.config.ts`
- [ ] **Step 3:** Add Prisma indexes: `@@index` on `guestId`, `userId`, `problemId`, `pattern`, `difficulty`
- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "chore: add rate limiting, csp headers, db indexes"
```

### Task 7.5: Deployment

- [ ] **Step 1:** Connect GitHub repo to Vercel
- [ ] **Step 2:** Configure environment variables in Vercel dashboard
- [ ] **Step 3:** Configure custom domain `patrnco.de`
- [ ] **Step 4:** Run Lighthouse audit (target 90+)
- [ ] **Step 5:** Expand seed data to 20+ problems across more patterns

---

## Verification

### Per-Phase Checks

- **Phase 0:** `bun dev` runs, `bun test` clean, `bun run lint` clean, husky pre-commit works
- **Phase 1:** Prisma schema migrated, 8 problems + test cases seeded, guest ID generated
- **Phase 2:** Browse problems, filter by pattern/difficulty, click into problem detail
- **Phase 3:** Start session, type Python in Monaco, run tests via Pyodide, see pass/fail with hidden test counts
- **Phase 4:** Request AI hint (streams in), chat with coach, see problem explanation, hints persisted to DB
- **Phase 5:** Complete session → see AI summary (strengths/weaknesses), mastery updated, dashboard shows stats
- **Phase 6:** Onboarding flow works, loading/error states, keyboard shortcuts, responsive
- **Phase 7:** Sign in with GitHub, guest sessions migrate, landing page, deployed to Vercel

### E2E Happy Path

1. Visit `patrnco.de` → see landing page → "Start practicing free"
2. Redirected to `/onboarding` → complete as "New to DSA"
3. `/practice` → filter "Two Pointers" + "Easy" → click "Valid Palindrome"
4. Select "Coach Me" → Start Session (no sign-up needed)
5. Three-panel view: read problem, write code, ask AI for Level 1 hint
6. Run tests → 3/5 pass → "Why did this fail?" → AI explains edge case
7. Fix code → all tests pass → "End Session"
8. See AI summary: strengths, weaknesses, complexity note
9. Dashboard: 1 problem solved, "Valid Palindrome" mastered
10. "Sign in to save progress" → GitHub OAuth → guest sessions linked

---

## Open Questions / Deferred

1. **Pyodide bundle size** (~20MB) — mitigate with lazy loading on first "Run" click + CDN caching. Monitor UX impact.
2. **"Add from LeetCode"** — UI placeholder in MVP. Users paste statement manually. API integration post-MVP.
3. **Voice mode** — explicitly post-MVP per PRD.
4. **Server-side execution** — upgrade path: Vercel Sandbox or Docker+FastAPI when hidden test enforcement matters more.
5. **Light mode** — future toggle. Dark mode only for MVP.
6. **Profile/settings page** — deferred until auth exists (Phase 7). Could add post-launch.

---

## Key Dependencies

```
# Core
next@15  react@19  react-dom@19  typescript

# Database
prisma  @prisma/client

# Guest ID
uuid  @types/uuid

# Auth (Phase 7)
@supabase/supabase-js  @supabase/ssr

# AI
ai  @ai-sdk/openai

# Editor
@monaco-editor/react

# Styling
tailwindcss@4  @tailwindcss/postcss  postcss  clsx  tailwind-merge

# Content
react-markdown  remark-gfm

# Dev
eslint  eslint-config-next  prettier  husky  lint-staged
@commitlint/cli  @commitlint/config-conventional
vitest  @vitejs/plugin-react  @vitest/coverage-v8  jsdom
@testing-library/react  @testing-library/dom  @testing-library/jest-dom
@playwright/test
```
