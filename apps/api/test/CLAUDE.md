# Test Helpers

Test infrastructure shared across all unit and e2e tests. Nothing here contains real business logic — these are test doubles and utilities.

## Structure

```
test/
├── cryptography/   # Fake implementations of cryptography abstractions
├── factories/      # Functions that create domain entities with fake data
├── repositories/   # In-memory implementations of repository abstractions
└── setup-e2e.ts    # Global setup/teardown for e2e tests (Testcontainers)
```

## Factories

Located in `test/factories/`. Each factory is a plain function that creates a domain entity using `@faker-js/faker` for realistic defaults, and accepts an `override` parameter to customize specific fields.

### Pattern

```typescript
import { faker } from '@faker-js/faker/locale/pt_BR'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { SomeEntity, type SomeEntityProps } from '@/domain/root/enterprise/entities/some-entity.ts'

export function makeSomeEntity(
  override: Partial<SomeEntityProps> = {},
  id?: UniqueEntityID,
) {
  return SomeEntity.create(
    {
      name: faker.lorem.words(3),
      ...override,
    },
    id,
  )
}
```

### Required fields

When an entity requires fields that have no sensible default (e.g. foreign keys like `workspaceId`, `userId`), the factory uses `WithRequired<Props, 'fieldName'>` instead of `Partial<Props>`, forcing callers to supply those fields explicitly.

```typescript
export function makeFolder(
  override: WithRequired<FolderProps, 'workspaceId'>,
  id?: UniqueEntityID,
) { ... }
```

### Existing Factories

| Factory | Entity | Required fields |
|---|---|---|
| `makeUser` | `User` | none |
| `makeWorkspace` | `Workspace` | `userId` |
| `makeFolder` | `Folder` | `workspaceId` |
| `makeItem` | `Item` | `workspaceId` |
| `makeTag` | `Tag` | `workspaceId` |

## In-Memory Repositories

Located in `test/repositories/`. Each class implements the corresponding repository abstraction from `@/domain/root/application/repositories/` using a plain in-memory `items` array.

### Pattern

```typescript
import type { SomeRepository } from '@/domain/root/application/repositories/some-repository.ts'
import type { SomeEntity } from '@/domain/root/enterprise/entities/some-entity.ts'

export class InMemorySomeRepository implements SomeRepository {
  items: SomeEntity[] = []

  async findById(id: string): Promise<SomeEntity | null> {
    return this.items.find((e) => e.id.toString() === id) ?? null
  }

  async create(entity: SomeEntity): Promise<void> {
    this.items.push(entity)
  }

  async save(entity: SomeEntity): Promise<void> {
    const index = this.items.findIndex((e) => e.id.toString() === entity.id.toString())
    if (index !== -1) this.items[index] = entity
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((e) => e.id.toString() === id)
    if (index !== -1) this.items.splice(index, 1)
  }
}
```

### Conventions

- The array is always named `items` and is public — tests assert state by inspecting it directly.
- IDs are always compared using `.id.toString()`.
- `null` parent IDs (e.g. `parentId`, `folderId`) map to `undefined` on the entity — `findByParentId(null)` returns entities where that field is `undefined`.

### Existing Repositories

| Class | Entity |
|---|---|
| `InMemoryUserRepository` | `User` |
| `InMemoryWorkspaceRepository` | `Workspace` |
| `InMemoryFolderRepository` | `Folder` |
| `InMemoryItemRepository` | `Item` |
| `InMemoryTagRepository` | `Tag` |

## Cryptography Fakes

Located in `test/cryptography/`. Fake implementations of the cryptography abstractions, designed to be deterministic and fast.

### `FakeHasher`

Implements both `HashGenerator` and `HashComparer`.

- `hash(plain)` → appends `-hashed` to the plain string
- `compare(plain, hash)` → checks `plain + '-hashed' === hash`

### `FakeEncrypter`

Implements `Encrypter`.

- `encrypt(payload)` → returns `JSON.stringify(payload)`

## E2E Tests

E2E tests live alongside controllers at `src/infra/http/controllers/*.e2e.spec.ts` and hit the real Fastify app via `app.inject()`.

### Convention

- **Happy path only** — e2e tests cover only success scenarios (2xx responses). Error cases (4xx/5xx) belong in unit tests (`.spec.ts`) for the corresponding use case.
- Each test file maps 1:1 to a controller.
- `beforeAll` calls `await app.ready()`.
- `afterEach` deletes all rows from affected tables in **dependency order** (children before parents: `items` → `folders` → `workspaces` → `users`).
- When setup requires chained requests (e.g. creating a user to get a `workspaceId`), extract those into private `async` helper functions inside the `describe` block.

### Pattern

```typescript
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /resource', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.items)
    await db.delete(schema.folders)
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  it('should create a resource and return 201 with resourceId', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/resource',
      payload: { ... },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ resourceId: expect.any(String) })
  })
})
```

## E2E Setup (`setup-e2e.ts`)

Used as `globalSetup` / `globalTeardown` in the Vitest e2e config. Spins up a real PostgreSQL instance using **Testcontainers** (`@testcontainers/postgresql`) and runs all Drizzle migrations against it before the test suite starts.

- Exports `setup()` and `teardown()`.
- Sets `process.env.DATABASE_URL` so all workers inherit the connection string.
- Uses `postgres:16-alpine` with database name `rootly`.
- Reads `.env.test` via `dotenv` before starting the container.
