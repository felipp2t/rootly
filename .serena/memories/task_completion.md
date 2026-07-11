## After API changes (`apps/api`)
1. `pnpm --filter api typecheck`
2. `pnpm --filter api lint` (biome check) — or `pnpm --filter api format` to auto-fix
3. `pnpm --filter api test` (unit); `pnpm --filter api test:e2e` if controllers/repositories touched
4. If routes/schemas (zod) changed: `pnpm --filter api openapi` then `pnpm --filter web generate` to keep the web client in sync
5. If Drizzle schema changed: `pnpm --filter api db:generate` then `pnpm --filter api db:migrate` (never hand-edit files under `apps/api/drizzle/`)

## After Web changes (`apps/web`)
1. `pnpm --filter web build` (runs `tsc -b` — this is the only typecheck for web, no separate typecheck script)
2. `pnpm --filter web format`
No web test suite exists as of this writing.
