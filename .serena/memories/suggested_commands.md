## Dev
- `pnpm dev` — API + Web in parallel; `pnpm dev:api` / `pnpm dev:web` individually.
- Local Postgres/MinIO: `docker compose -f apps/api/docker-compose.yaml up -d` (compose file lives under `apps/api`, not repo root).

## API (`apps/api`, or `pnpm --filter api <script>` from root)
- `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio` / `pnpm db:seed`
- `pnpm test` (unit, vitest), `pnpm test:watch`, `pnpm test:cov`, `pnpm test:e2e` (spins up Testcontainers postgres)
- `pnpm typecheck` (`tsc --noEmit`), `pnpm lint` (`biome check`), `pnpm format` (`biome format --write`)
- `pnpm openapi` — regenerates `apps/api/openapi.json`

## Web (`apps/web`, or `pnpm --filter web <script>`)
- `pnpm generate` — runs API's `openapi` script then `orval` to regenerate `src/api/**`. Run this after any API route/schema change.
- No dedicated web test suite or lint script exists (only `format`); correctness is checked via `tsc -b` (part of `build`).

## Root
- `pnpm build` / `pnpm lint` / `pnpm format` — fan out to all workspaces (`pnpm -r`).
