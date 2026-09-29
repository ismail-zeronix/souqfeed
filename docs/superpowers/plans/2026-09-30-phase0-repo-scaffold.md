# Phase 0: Repo Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the empty-of-code SouqFeed repo into a running Next.js app with
working tooling (lint/format/test), local Postgres+Redis via Docker Compose,
fail-fast environment validation, and structured logging — with none of the
documentation already committed disturbed.

**Architecture:** Single Next.js (App Router, TypeScript) app scaffolded with
`create-next-app` into a temporary sibling directory, then merged into the
repo root (the repo is not empty — it already holds `docs/`, `CLAUDE.md`,
`README.md`, `project_plan.md`, `current.md` from the foundation-docs pass).
Everything else (Vitest, env validation, logging) is added directly on top.

**Tech Stack:** Next.js (App Router) + TypeScript + Tailwind CSS, pnpm,
ESLint + Prettier, shadcn/ui, Vitest, Zod, pino, Docker Compose
(postgres:16-alpine, redis:7-alpine).

**Spec:** `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md`
(architecture/decisions) and `docs/architecture.md`, `docs/deployment.md`
(current-state references this plan keeps in sync).

## Global Constraints

- Package manager is pnpm — never npm/yarn for installing or running scripts
  (per `project_plan.md`).
- No new library without a real, current problem it solves (Rule 6) — every
  dependency added below is consumed by a concrete deliverable in this plan,
  not held in reserve for a later phase.
- No giant files — split by responsibility (Rule 4).
- `.env` (real secrets) must never be committed — only `.env.example` is
  tracked.
- This plan only produces the **local-dev** `docker-compose.yml`. The
  production overlay (`docker-compose.prod.yml`) is Phase 14 scope per
  `docs/deployment.md` — do not build it here.
- Module folders under `src/modules/*` are not created in this phase — they
  come into existence in the phase that first adds real files to them
  (Phase 1 onward), per YAGNI. An empty directory isn't meaningfully
  trackable in git anyway.

## Review Focus

1. **Scaffolding into a non-empty repo silently clobbers existing docs.**
   `create-next-app` generates its own `README.md`; the repo already has a
   real one. Mitigation: scaffold into a temporary sibling directory and
   merge deliberately, verifying `git status` shows no deletions/overwrites
   of the seven `docs/*.md` files, `CLAUDE.md`, `README.md`,
   `project_plan.md`, or `current.md` (Task 1, Step 6).
2. **Missing/invalid environment variables produce a confusing failure deep
   in framework code instead of a clear message at boot.** Mitigation: `env.ts`
   throws a descriptive, field-by-field error before any consumer runs
   (Task 4, tested directly).
3. **A secret leaks into git** via a committed `.env` or a value hard-coded
   somewhere other than `.env.example`. Mitigation: verify the generated
   `.gitignore` covers `.env*.local` and add explicit coverage for `.env`
   itself; check `git status` after every task shows no `.env` file staged
   (Task 1, Step 6; re-checked in Task 7).
4. **Docker containers report "up" before they're actually ready**, so a
   command run immediately after `docker compose up -d` fails intermittently
   (e.g. Postgres still initializing). Mitigation: `docker-compose.yml`
   defines healthchecks for both services, and Task 6's verification waits
   for `healthy` status, not just `Up`.
5. **Windows-specific shell assumptions break scripts.** This repo is
   developed on Windows (Git Bash + PowerShell both available). Mitigation:
   every `package.json` script below runs a cross-platform Node-based tool
   (`next`, `eslint`, `prettier`, `vitest`) — none shell out to POSIX-only
   commands.

---

### Task 1: Scaffold Next.js into the existing repo without disturbing docs

**Files:**
- Create (via `create-next-app`, then merged into repo root): `package.json`,
  `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`,
  `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`,
  `src/app/globals.css`
- Modify: `.gitignore` (add `.env`, keep `.env.example` tracked — see Task 4)

**Interfaces:**
- Produces: a working `pnpm dev` / `pnpm build` / `pnpm lint` toolchain every
  later task builds on.

- [ ] **Step 1: Install pnpm (not present on this machine) and confirm toolchain**

```bash
node -v          # confirm a recent Node is present
npm install -g pnpm
pnpm -v          # confirm pnpm is now on PATH
```

Expected: `pnpm -v` prints a version number (no "command not found").

- [ ] **Step 2: Scaffold Next.js into a temporary sibling directory**

Scaffolding directly into `.` would collide with the `README.md` this repo
already has, and risks the CLI treating a non-empty directory unpredictably.
Scaffold next to the repo instead:

```bash
cd /e/CODING
pnpm create next-app@latest souqfeed-scaffold-tmp \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-pnpm --no-git
```

If any prompt still appears despite these flags, accept the shown default.

Expected: `/e/CODING/souqfeed-scaffold-tmp` now contains a full Next.js app
(no `.git` directory, since `--no-git` was passed).

- [ ] **Step 3: Remove the generated README so it can't overwrite the real one**

```bash
rm /e/CODING/souqfeed-scaffold-tmp/README.md
```

- [ ] **Step 4: Merge the scaffold into the repo root**

```bash
cd /e/CODING/marketfeed
cp -a /e/CODING/souqfeed-scaffold-tmp/. ./
rm -rf /e/CODING/souqfeed-scaffold-tmp
```

`cp -a` copies recursively without deleting anything already present, so
`docs/`, `CLAUDE.md`, `project_plan.md`, `current.md`, `ui-design-ideas/`,
and `.git/` are untouched.

- [ ] **Step 5: Add `engines` to `package.json`**

Open the generated `package.json` and add (keep every generated field —
only add this one):

```json
"engines": {
  "node": ">=20.9.0",
  "pnpm": ">=9"
}
```

- [ ] **Step 6: Verify nothing existing was disturbed, then commit**

```bash
git status
```

Expected: only new/untouched-generated files appear as untracked/new
(`package.json`, `tsconfig.json`, `next.config.ts`, `src/`, `public/`,
`.gitignore`, `eslint.config.mjs`, `postcss.config.mjs`,
`pnpm-lock.yaml`); none of the seven `docs/*.md` files, `CLAUDE.md`,
`README.md`, `project_plan.md`, or `current.md` show as modified or deleted.

```bash
pnpm install
pnpm dev &
sleep 3
curl -sf http://localhost:3000 > /dev/null && echo "OK: dev server responded"
kill %1
```

Expected: `OK: dev server responded`.

```bash
pnpm build
```

Expected: build succeeds with no errors.

```bash
git add -A
git commit -m "chore: scaffold Next.js app (TypeScript, Tailwind, pnpm)"
```

---

### Task 2: Prettier, wired to not fight ESLint

**Files:**
- Create: `.prettierrc.json`, `.prettierignore`
- Modify: `package.json` (add `format`/`format:check` scripts, devDependencies), `eslint.config.mjs` (disable formatting-related rules via `eslint-config-prettier`)

**Interfaces:**
- Consumes: `eslint.config.mjs` from Task 1.
- Produces: `pnpm format` / `pnpm format:check` scripts later tasks and CI can rely on.

- [ ] **Step 1: Install Prettier and the Tailwind class-sorting plugin**

```bash
pnpm add -D prettier prettier-plugin-tailwindcss eslint-config-prettier
```

- [ ] **Step 2: Add Prettier config**

`.prettierrc.json`:
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

`.prettierignore`:
```
.next/
node_modules/
pnpm-lock.yaml
```

- [ ] **Step 3: Disable ESLint rules that conflict with Prettier**

Edit `eslint.config.mjs` — import and append `eslint-config-prettier`'s
config as the last entry in the exported array, e.g.:

```js
import prettierConfig from "eslint-config-prettier";
// ...existing config...
export default [
  ...existingConfig,
  prettierConfig,
];
```

(Match this to whatever export shape `create-next-app` generated — the
requirement is that `eslint-config-prettier` is the last entry so its
rule-disabling wins.)

- [ ] **Step 4: Add scripts and verify**

`package.json` scripts:
```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

```bash
pnpm format
pnpm format:check
```

Expected: `format:check` exits 0 (no unformatted files) after `format` has run.

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add Prettier with Tailwind class sorting"
```

---

### Task 3: shadcn/ui initialization

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`
- Modify: `src/app/page.tsx` (render one `Button` to prove the pipeline works)

**Interfaces:**
- Produces: `cn()` helper at `src/lib/utils.ts`, consumed by every future
  shadcn component; `components/ui/` as the location for all future shadcn
  primitives (per `docs/architecture.md`'s `components/ui/` convention).

- [ ] **Step 1: Initialize shadcn/ui with defaults**

```bash
pnpm dlx shadcn@latest init -d
```

If prompted despite `-d`, accept the shown defaults (this phase does not
apply `docs/theme.md`'s colors yet — that's a later, separate UI pass).

Expected: `components.json` created, `src/lib/utils.ts` created with a `cn`
helper, Tailwind config updated by the CLI.

- [ ] **Step 2: Add one primitive to prove the pipeline works**

```bash
pnpm dlx shadcn@latest add button
```

Expected: `src/components/ui/button.tsx` created.

- [ ] **Step 3: Use it and verify the build**

Edit `src/app/page.tsx` to render `<Button>SouqFeed</Button>` somewhere in
the existing markup (import from `@/components/ui/button`).

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: initialize shadcn/ui, add Button primitive"
```

---

### Task 4: Vitest + environment validation (TDD)

**Files:**
- Create: `vitest.config.ts`, `src/lib/validation/env.ts`, `src/lib/validation/env.test.ts`, `.env.example`
- Modify: `package.json` (add `test` script, devDependencies), `.gitignore` (ensure `.env` is ignored; `.env.example` stays tracked)

**Interfaces:**
- Produces: `parseEnv(source?: NodeJS.ProcessEnv): Env` and
  `getEnv(): Env` from `src/lib/validation/env.ts` — every later phase reads
  configuration through `getEnv()`, never `process.env` directly.

- [ ] **Step 1: Install Vitest, Zod, and the tsconfig-paths plugin**

```bash
pnpm add zod
pnpm add -D vitest vite-tsconfig-paths
```

- [ ] **Step 2: Configure Vitest**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
  },
});
```

`package.json` script:
```json
"test": "vitest run"
```

- [ ] **Step 3: Write the failing test**

`src/lib/validation/env.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const validEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  REDIS_URL: "redis://localhost:6379",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

describe("parseEnv", () => {
  it("parses a valid environment and defaults LOG_LEVEL", () => {
    const env = parseEnv(validEnv);
    expect(env.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(env.LOG_LEVEL).toBe("info");
  });

  it("throws a descriptive error when DATABASE_URL is missing", () => {
    const { DATABASE_URL, ...rest } = validEnv;
    expect(() => parseEnv(rest)).toThrow(/DATABASE_URL/);
  });

  it("throws when BETTER_AUTH_SECRET is too short", () => {
    expect(() =>
      parseEnv({ ...validEnv, BETTER_AUTH_SECRET: "short" }),
    ).toThrow(/BETTER_AUTH_SECRET/);
  });
});
```

- [ ] **Step 4: Run it, verify it fails**

```bash
pnpm test
```

Expected: FAIL — `src/lib/validation/env.ts` does not exist yet.

- [ ] **Step 5: Implement `env.ts`**

```ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

// Lazy singleton: importing this module must never itself trigger parsing
// (a test importing `parseEnv` would otherwise parse the real process.env
// as a side effect). Real consumption happens through getEnv().
let cachedEnv: Env | undefined;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = parseEnv(process.env);
  }
  return cachedEnv;
}
```

- [ ] **Step 6: Run it, verify it passes**

```bash
pnpm test
```

Expected: PASS — all three tests green.

- [ ] **Step 7: Add `.env.example` and confirm `.env` is gitignored**

`.env.example`:
```
DATABASE_URL=postgresql://souqfeed:souqfeed@localhost:5432/souqfeed
REDIS_URL=redis://localhost:6379
BETTER_AUTH_SECRET=replace-with-a-random-32-byte-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=debug
```

Confirm `.gitignore` (generated by `create-next-app`) already ignores
`.env*.local`; add an explicit `.env` line if it's not already covered, so a
plain `.env` can never be committed:

```bash
grep -qxF '.env' .gitignore || echo '.env' >> .gitignore
```

Copy it for local use (not committed):
```bash
cp .env.example .env
```

- [ ] **Step 8: Verify `.env` is not tracked, then commit**

```bash
git status
```

Expected: `.env` does not appear (ignored); `.env.example` appears as a new
file to commit.

```bash
git add -A
git commit -m "feat: add Vitest and fail-fast environment validation"
```

---

### Task 5: Structured logging (TDD)

**Files:**
- Create: `src/lib/logging/logger.ts`, `src/lib/logging/logger.test.ts`
- Modify: `package.json` (devDependencies)

**Interfaces:**
- Consumes: nothing from Task 4 — deliberately decoupled from `env.ts` (see
  rationale below) to avoid import-order coupling between infrastructure
  modules.
- Produces: `createLogger(level?): Logger` and a ready-to-use `logger`
  singleton from `src/lib/logging/logger.ts`. Every later module logs
  through this, never `console.log` (Rule: no console.log spam, per
  `CLAUDE.md`'s source rules).

- [ ] **Step 1: Install pino**

```bash
pnpm add pino
pnpm add -D pino-pretty
```

- [ ] **Step 2: Write the failing test**

`src/lib/logging/logger.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { createLogger } from "./logger";

describe("createLogger", () => {
  it("creates a logger at the requested level", () => {
    const logger = createLogger("debug");
    expect(logger.level).toBe("debug");
  });

  it("defaults to info when no level is given", () => {
    const logger = createLogger();
    expect(logger.level).toBe("info");
  });
});
```

- [ ] **Step 3: Run it, verify it fails**

```bash
pnpm test
```

Expected: FAIL — `src/lib/logging/logger.ts` does not exist yet.

- [ ] **Step 4: Implement `logger.ts`**

```ts
import pino, { type Logger } from "pino";

type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export function createLogger(level: LogLevel = "info"): Logger {
  return pino({
    level,
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  });
}

export const logger = createLogger(
  (process.env.LOG_LEVEL as LogLevel | undefined) ?? "info",
);
```

- [ ] **Step 5: Run it, verify it passes**

```bash
pnpm test
```

Expected: PASS — both tests green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add structured logging with pino"
```

---

### Task 6: Docker Compose for local Postgres + Redis

**Files:**
- Create: `docker-compose.yml`

**Interfaces:**
- Produces: a `postgres` service reachable at the `DATABASE_URL` in
  `.env.example` and a `redis` service reachable at `REDIS_URL` — Phase 1's
  Drizzle client and every later phase's BullMQ setup connect to these.

- [ ] **Step 1: Write `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: souqfeed
      POSTGRES_PASSWORD: souqfeed
      POSTGRES_DB: souqfeed
    ports:
      - "5432:5432"
    volumes:
      - souqfeed_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U souqfeed"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - souqfeed_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  souqfeed_postgres_data:
  souqfeed_redis_data:
```

This matches the `DATABASE_URL`/`REDIS_URL` values already in `.env.example`
(Task 4) — user/password/db name `souqfeed`, default ports.

- [ ] **Step 2: Start it and wait for both services to report healthy**

```bash
docker compose up -d
```

```bash
for i in $(seq 1 20); do
  status=$(docker compose ps --format json | grep -o '"Health":"[a-z]*"' | sort -u)
  echo "$status"
  echo "$status" | grep -q 'starting' || break
  sleep 2
done
docker compose ps
```

Expected: both `postgres` and `redis` show `healthy` in `docker compose ps`.

- [ ] **Step 3: Confirm actual connectivity, then tear down**

```bash
docker compose exec -T postgres pg_isready -U souqfeed
docker compose exec -T redis redis-cli ping
```

Expected: `accepting connections` and `PONG` respectively.

```bash
docker compose down
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add Docker Compose for local Postgres and Redis"
```

---

### Task 7: Full-loop verification and status update

**Files:**
- Modify: `current.md`

No new product code — this task proves every piece from Tasks 1–6 works
together, then records that Phase 0 is done.

- [ ] **Step 1: Full loop from a clean start**

```bash
docker compose up -d
sleep 5
docker compose ps            # both services healthy
pnpm install
pnpm lint
pnpm format:check
pnpm test                    # all Task 4 + Task 5 tests pass
pnpm build
pnpm dev &
sleep 3
curl -sf http://localhost:3000 > /dev/null && echo "OK: app responded"
kill %1
docker compose down
```

Expected: every command succeeds; final line prints `OK: app responded`.

- [ ] **Step 2: Confirm no secrets are tracked**

```bash
git status
git ls-files | grep -x '\.env' && echo "FAIL: .env is tracked" || echo "OK: .env not tracked"
```

Expected: `OK: .env not tracked`.

- [ ] **Step 3: Update `current.md`**

Move the "Next" items about Phase 0 into "Completed", and set "Next" to
Phase 1 (full Drizzle schema, Better Auth, seed script, minimal login page —
see `project_plan.md`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: complete Phase 0 repo scaffold"
```

## Self-Review Notes

- **Spec coverage:** every Global Constraint and Review Focus item above is
  exercised by a task's verification step (constraints: pnpm-only in every
  task's commands; no-new-library justified per dependency added; no
  production compose file created; no empty module dirs created. Review
  focus: #1 → Task 1 Step 6, #2 → Task 4 Steps 3–6, #3 → Task 4 Step 8 and
  Task 7 Step 2, #4 → Task 6 Step 2, #5 → all scripts are Node-tool-based).
- **Type/name consistency:** `parseEnv`/`getEnv`/`Env` (Task 4) and
  `createLogger`/`logger` (Task 5) are the only cross-task exports introduced
  in this phase; both names are used identically wherever referenced above.
- **No placeholders:** every step has runnable commands or complete file
  contents; nothing is marked TBD.
