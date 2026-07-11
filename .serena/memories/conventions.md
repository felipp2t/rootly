Layer-specific patterns (entity shape, use-case shape, controller shape, schema shape) live in nested `CLAUDE.md` files — see `mem:core` for the list. This memory only covers conventions that cut across layers/modules.

## Error handling flow
- Entities/validators (`enterprise` layer): may `throw`, wrapped at call sites via `safeEither` (`@/core/utils/safe-execute.ts`) to enter the `Either` pipeline.
- Use cases (`application` layer): never throw — always return `Either<BaseError, T>` (`@/core/types/either.ts`).
- Controllers (`infra/http`): `switch (error.constructor.name)` maps each domain error to an HTTP status; always a `default: 500`.

## Auth
No Fastify auth hook/decorator — every protected controller manually calls `verifyJwt(request.cookies.accessToken)` (`apps/api/src/infra/http/verify-jwt.ts`) at the top of its handler. Tokens live only in httpOnly cookies, never in response bodies.

## DB
IDs are 12-char alphanumeric `nanoid()`, table names plural, TS camelCase / SQL snake_case. Full conventions: nested drizzle `CLAUDE.md` (`mem:core`).

## Path aliases
- API: `@/*` → `apps/api/src/*`, `@test/*` → `apps/api/test/*`
- Web: `@/*` → `apps/web/src/*`
