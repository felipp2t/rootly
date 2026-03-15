# Test Writer Agent Memory

See `patterns.md` for detailed notes. Summary below.

## Framework & Config
- Test framework: **Vitest** (configured via vitest config in the monorepo root)
- Unit test file naming: `<use-case-name>.spec.ts`, co-located alongside the implementation
- E2E test file naming: `<controller-name>.e2e.spec.ts` (dot-separated, not hyphen), co-located alongside the controller

## Key Conventions
- SUT variable is always named `sut`
- Repository variables are named `<entityName>Repository` (e.g. `workspaceRepository`)
- `describe` block name matches the class name (PascalCase, no prefix): `describe('CreateWorkspace', ...)`
- `beforeEach` reinitializes all dependencies and `sut` fresh for every test
- All use cases return `Either` — check `.isRight()` / `.isLeft()`, never throw

## Test Infrastructure Locations
- In-memory repos: `test/repositories/in-memory-<entity>-repository.ts`
- Entity factories: `test/factories/make-<entity>.ts`
- Crypto fakes: `test/cryptography/faker-hasher.ts`, `test/cryptography/faker-encryper.ts`
- E2E global setup: `test/setup-e2e.ts`

## Import Aliases
- `@test/` maps to `test/` directory
- `@/` maps to `src/`

## What to Test in Use Cases
1. Happy path — `isRight()` + shape of `response.value` via `toMatchObject`
2. Side effects — assert `repository.items` length and field values after execution
3. Return value identity — assert `response.value.entityId === repository.items[0].id.toString()`
4. Error cases — `isLeft()` + `toBeInstanceOf(SpecificError)` (only when use case can fail)

## Existing Factories (required fields)
| Factory | Required override fields |
|---|---|
| `makeUser` | none |
| `makeWorkspace` | `userId` |
| `makeFolder` | `workspaceId` |
| `makeItem` | `workspaceId` |
| `makeTag` | `workspaceId` |
| `makeWorkspaceInvite` | `workspaceId`, `invitedUserId`, `invitedByUserId`, `roleId` |
| `makeWorkspaceMember` | `userId`, `workspaceId`, `roleId` |
| `makeRefreshToken` | `userId` |

## Use UniqueEntityID for Synthetic IDs in Tests
When a test needs a foreign-key ID (e.g. `inviterId`, `workspaceId`, `roleId`) that is not
backed by a real entity in the repository, generate it with `new UniqueEntityID().toString()`.
Import from `@/core/entities/unique-entity-id.ts`.

## Seeding Entities Without a Factory
When no `test/factories/make-<entity>.ts` exists, construct the entity directly using its
static `create()` method and push it into `repository.items` manually. For example:

```typescript
const role = WorkspaceRole.create({ name: 'Developer', workspaceId: workspace.id.toString() })
workspaceRoleRepository.items.push(role)
```

This avoids creating a factory just for test setup when the entity constructor is simple.

## Watch for Missing Methods in In-Memory Repos
Before writing tests, always verify that every method called by the use case under test
is actually implemented in the corresponding in-memory repository. Cross-check the abstract
repository class against the in-memory implementation for all methods:

If the abstract class declares a method that is missing from the in-memory repo,
add it before writing the tests — otherwise the test will fail silently or throw at runtime.

## E2E Conventions
- Use `app.inject()` (Fastify) — no supertest
- `beforeAll(() => app.ready())`
- `afterEach` deletes rows in dependency order: refreshTokens → items → folders → workspaceMembers → workspaceInvites → rolePermissions → workspaceRoles → workspaces → users (respect FK constraints; add tables only if the test creates those rows)
- Happy path only in e2e; error cases belong in unit tests (exception: 401 auth checks are acceptable when they test infrastructure wiring)
- `create-workspace` does NOT create a workspace_member row — seed membership manually with `db.insert(schema.workspaceMembers)` after fetching the auto-created workspaceRole by workspaceId
- Auth uses httpOnly cookies — `POST /api/sessions` sets `accessToken` and `refreshToken` cookies; returns `201 {}` (no body tokens)
- `POST /api/sessions/refresh` reads `refreshToken` from cookies; sets new cookies; returns `200 {}`
- `GET /api/me` reads `accessToken` from cookies (no Authorization header)
- To authenticate in e2e tests: POST /api/accounts, POST /api/sessions, extract `Set-Cookie` header, build cookie string
- Cookie extraction pattern: `const cookies = [].concat(response.headers['set-cookie']); const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ')`
- Pass cookies in subsequent requests via `headers: { cookie: cookieHeader }`
- `describe` block name in e2e tests uses the HTTP method + path format: `describe('POST /sessions/refresh', ...)`

## Protected Routes — Auth Required in E2E Tests
All routes except `POST /accounts`, `POST /sessions`, and `POST /sessions/refresh` require the
`accessToken` cookie. When writing e2e tests for protected routes:
1. Always start with a `createUserAndGetCookieHeader()` (or combined variant) helper that does:
   POST /api/accounts → POST /api/sessions → extract Set-Cookie header into a cookie string.
2. Pass `headers: { cookie: cookieHeader }` on every call to a protected route, including
   intermediate setup calls (e.g. POST /workspaces, POST /folders, POST /tags, POST /items).
3. `POST /workspaces` no longer accepts `userId` in the body — userId comes from the JWT.
   Remove any `userId` field from the `POST /workspaces` payload.
4. The `afterEach` cleanup in tests that call `POST /workspaces` must delete workspace-related
   tables in FK order: workspaceMembers → workspaceInvites → rolePermissions → workspaceRoles → workspaces.
