## Layering (Clean Architecture + DDD)
`src/core` (framework-agnostic base classes/utils: `Entity`, `AggregateRoot`, `UniqueEntityID`, `Either`, `BaseError`, domain events, `Optional`/`WithRequired` types) → `src/domain/<context>` (`application` + `enterprise` sublayers) → `src/infra` (`auth`, `cryptography`, `db`, `env`, `events`, `http`, `realtime`, `storage`).

## Bounded contexts under `src/domain`
- `root` — users, workspaces, folders, items, roles/permissions, invites. The large one; see its nested `CLAUDE.md` files (`mem:core`).
- `notification` — in-app notifications; has its own `application/{gateways,repositories,subsribers,use-cases}` and `enterprise/entities`. Reacts to root-domain events via subscribers (e.g. `application/subsribers/on-user-invited.ts` — note the "subsribers" typo in the actual directory name, not "subscribers").

## Wiring
Concrete infra implementations (Drizzle repos, Argon2/JWT crypto) are only ever instantiated in `src/infra/http/factories/make-*.ts`, one factory per use case. Controllers call the factory inside the handler, never at module scope.

## Detailed conventions (read before editing these areas)
`mem:core` lists the nested `CLAUDE.md` files for enterprise entities/validators, use-cases, HTTP controllers/factories, Drizzle schema, and test doubles/e2e.
