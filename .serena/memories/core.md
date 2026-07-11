## Rootly — project map

Monorepo (pnpm workspaces, v10+, catalog: in `pnpm-workspace.yaml`): `apps/api` (backend) + `apps/web` (frontend).

- Backend structure/conventions: `mem:api/core`
- Frontend structure/conventions: `mem:web/core`
- Stack/versions: `mem:tech_stack`
- Commands actually run day-to-day: `mem:suggested_commands`
- Cross-cutting conventions (error handling, auth, DB IDs, generated files): `mem:conventions`
- What to run before considering a task done: `mem:task_completion`

## Invariant: in-tree CLAUDE.md docs are the primary source

Several subdirectories already have detailed `CLAUDE.md` files with patterns + code examples — read those instead of re-deriving or duplicating in memory:
- `apps/api/src/domain/root/enterprise/CLAUDE.md` — entities, validators, `safeEither`
- `apps/api/src/domain/root/application/use-cases/CLAUDE.md` — use-case pattern, `Either`, DI, testing
- `apps/api/src/infra/http/CLAUDE.md` — controllers, factories, auth cookies, error→status mapping
- `apps/api/src/infra/db/drizzle/CLAUDE.md` — schema conventions, migrations
- `apps/api/test/CLAUDE.md` — fakes, in-memory repos, e2e pattern

## Never hand-edit (generated)

- `apps/api/drizzle/**` — drizzle-kit migrations
- `apps/web/src/api/**` — orval-generated HTTP client/models
- `apps/web/src/route-tree.gen.ts` — TanStack Router plugin output
