# Test Writer Agent Memory

See `patterns.md` for detailed notes. Summary below.

## Framework & Config
- Test framework: **Vitest** (configured via vitest config in the monorepo root)
- Unit test file naming: `<use-case-name>.spec.ts`, co-located alongside the implementation
- E2E test file naming: `<controller-name>.e2e-spec.ts`, co-located alongside the controller

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

## Existing In-Memory Repos
`InMemoryUserRepository`, `InMemoryWorkspaceRepository`, `InMemoryFolderRepository`,
`InMemoryItemRepository`, `InMemoryTagRepository`

## E2E Conventions
- Use `app.inject()` (Fastify) — no supertest
- `beforeAll(() => app.ready())`
- `afterEach` deletes rows in dependency order: items → folders → workspaces → users
- Happy path only in e2e; error cases belong in unit tests
- Auth/JWT setup: check existing e2e specs (not yet documented — add when explored)
