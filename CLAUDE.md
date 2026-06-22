# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Read AGENTS.md first.** This project runs **Next.js 16** + **React 19** with the React Compiler enabled. APIs and conventions differ from older versions you may know — consult `node_modules/next/dist/docs/` before writing framework code and heed deprecation notices.

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run lint       # Biome check (lint + format + import organization)
npm run format     # Biome format --write
npm run db:types   # Regenerate src/types/supabase.ts from the live Supabase schema
npm run doctor     # Run react-doctor (React lint/a11y/bundle/architecture scan)
```

- **Lint/format is Biome, not ESLint/Prettier** (`biome.json`): 2-space indent, recommended rules + `next`/`react` domains, import organization on. There is no test runner configured.
- **Package manager:** `bun.lock` is present (Supabase docs use `bun run db:types`); `npm run` also works. Pick one and stay consistent.
- `db:types` is hardcoded to project id `njgsrfigfjcqdrtljwrn`, `public` schema.

## Environment

Requires Supabase env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser/server clients), and `SUPABASE_SERVICE_ROLE_KEY` (admin client only — server-side, never bundled to the client).

## Architecture

Brisa is a hierarchical financial dashboard (Super Admin → Jefe Operador → Asociado). **The server/DB is the source of truth.** Business logic (atomicity, balance math, hierarchy) lives in PostgreSQL via triggers, RPCs, and RLS — the frontend never reimplements transactional logic. The authoritative design contract is `docs/architecture_contract.md` (Spanish); `docs/CONTEXT.md` tracks session state and notes where the live DB diverges from the SQL dumps in `docs/`.

### The per-entity slice pattern (the central convention)

Every DB entity maps to one vertical slice. To add/change an entity, you touch the same layers in order:

```
SQL table → src/types (regen) → src/lib/services/<entity>.service.ts
          → src/lib/swr/keys.ts → src/hooks/queries + src/hooks/mutations → UI
```

Layers and their strict responsibilities:

- **`src/lib/services/*.service.ts`** — One file per entity. The *only* place that calls the Supabase client (`.from()`, `.rpc()`). Typed queries + RPC wrappers + standardized errors (`_base.ts`: `ServiceError`, `handleError`, `PaginatedResult`). **No business logic here.**
- **`src/hooks/queries/use-*.ts`** (`useSWR`) and **`src/hooks/mutations/use-*.ts`** (`useSWRMutation`) — The *only* layer that touches SWR. Components never call `useSWR` directly; they use these hooks.
- **`src/lib/actions/`** — Server Actions for mutations by the **authenticated user on their own data** (RLS protects the row). Currently only `auth.ts`. Server Actions must never use the service-role key.
- **`src/app/api/*/route.ts`** — API Routes only when you need the **service role**, third-party payloads/webhooks, or raw HTTP. Currently `auth/register` and `auth/invite`, both gated by `withAuth` middleware to `super_admin`.
- **`src/components/`** — Receive props, emit callbacks. They know nothing about Supabase, SWR keys, or roles. `components/ui/` is shadcn (style `base-nova`) — treat as generated.
- **`src/store/`** — Zustand for **local/UI state only** (`auth-store.ts` persists just role + permissions). SWR owns server state; Zustand does not duplicate it.

### Supabase clients (`src/lib/supabase/`)

Pick the right one — they enforce the security boundary:
- `client.ts` → `createBrowserSB` (browser, anon key)
- `server.ts` → server components/actions (cookies-based session)
- `server-admin.ts` / `service.ts` → `createAdminSB` (service role) — **server-only**, never import into a client component.

### SWR caching & invalidation (`src/lib/swr/`)

- **Keys are always serializable arrays** namespaced `["brisa", <entity>, <scope>, ...params]` — built via the `KEYS` factory in `keys.ts`. Never concatenate strings (breaks prefix invalidation).
- After a mutation, invalidate the entity **and its cascade dependencies**. `invalidate.ts` defines `CASCADE_INVALIDATIONS` (e.g. mutating `transactions` also invalidates `user_balances`, `monthly_expenses`, `goal_progress`, `v_debts_snowball`, `budget_requests`). Use `invalidateWithCascade(entity)`.
- `useRealtime.ts` subscribes to Supabase Realtime and calls `mutate()` to keep clients in sync (<1.5s target for budget approvals).
- Prefer revalidation over optimistic updates for operations backed by complex triggers/RPCs (e.g. `assign_budget`), where rollback can leave inconsistent state.

### Types (`src/types/`)

- `supabase.ts` is **generated — never edit** (`npm run db:types`). Enriched/joined types (e.g. `TransactionWithTags`) go in `domain.ts`, re-exported from `index.ts`. Avoid `any`; use `Database['public']['Tables'][...]` rows.

### Routing & auth

- App Router with route groups: `(public)` (landing `/`), `(auth)` (login/register), `(dashboard)` (protected). Parens don't affect the URL.
- `src/middleware.ts` protects routes and redirects (authed users away from `/`,`/login`; unauthed to `/login`). Next 16 deprecated `middleware.ts` in favor of proxy — works for now, migrate eventually.
- SWRProvider + auth hydration wrap **only** the dashboard layout.

## Hard rules (anti-patterns to avoid)

1. Never import the admin/service-role client into a client component or Server Action.
2. Never trust `userId` from a request body — derive it from `auth.uid()` / validated session.
3. Never write to `user_balances` from the frontend — it's read-only; triggers maintain it.
4. Never edit `src/types/supabase.ts` by hand — regenerate it.
5. Validate all user input with Zod before touching Supabase, in both Server Actions and API Routes.
6. Don't put business logic in components — it belongs in the DB, Server Actions, or services.
7. Don't hardcode role checks (`role === 'super_admin'`) in UI — prefer permission checks.
