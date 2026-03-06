# Use Cases

Business logic for the root domain. Each use case represents a single, well-defined action.

## Pattern

Every use case follows the same structure:

1. **Input** — a typed `interface` named `<UseCaseName>Request`
2. **Output** — an `Either<BaseError, SuccessPayload>` type alias named `<UseCaseName>Response`
3. **Class** — receives dependencies via constructor injection, exposes a single `execute()` method

```typescript
import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'

interface DoSomethingUseCaseRequest {
  name: string
}

type DoSomethingUseCaseResponse = Either<BaseError, { entityId: string }>

export class DoSomethingUseCase {
  constructor(private readonly repository: SomeRepository) {}

  async execute({ name }: DoSomethingUseCaseRequest): Promise<DoSomethingUseCaseResponse> {
    // validation and business logic...
    return right({ entityId: entity.id.toString() })
  }
}
```

## Either

All use cases return `Either<L, R>` — never throw errors.

- `left(error)` — failure path, carries a `BaseError`
- `right(value)` — success path, carries the result payload
- Check with `.isLeft()` / `.isRight()` at the call site

```typescript
const result = await useCase.execute(input)

if (result.isLeft()) {
  // result.value is the error
}

// result.value is the success payload
```

## Errors

Use case errors live in `./_errors/` and must:
- Extend `Error`
- Implement `BaseError`
- Have a descriptive message

```typescript
import type { BaseError } from '@/core/errors/base-error.ts'

export class UserAlreadyExistsError extends Error implements BaseError {
  constructor(identifier: string) {
    super(`User "${identifier}" already exists.`)
  }
}
```

Use errors without a context parameter when leaking information is a security risk (e.g. `WrongCredentialsError` does not reveal whether the email or password was wrong).

## Dependency Injection

Use cases depend on **abstractions** (abstract classes or interfaces), never on concrete implementations.

```typescript
// correct — depends on the abstraction
constructor(private userRepository: UserRepository) {}

// wrong — depends on the concrete class
constructor(private userRepository: DrizzleUserRepository) {}
```

Concrete implementations are wired in infra factories at `src/infra/http/factories/`.

## Testing

Each use case has a `.spec.ts` file alongside it. Tests use:
- **In-memory repositories** from `test/repositories/`
- **Fake cryptography** from `test/cryptography/` (`FakeHasher`, `FakeEncrypter`)
- **Entity factories** from `test/factories/`

The variable holding the use case under test is always named `sut` (System Under Test).

```typescript
import { FakeHasher } from '@test/cryptography/faker-hasher.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'

let inMemoryUserRepository: InMemoryUserRepository
let fakeHasher: FakeHasher
let sut: RegisterUserUseCase

describe('Register User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository()
    fakeHasher = new FakeHasher()
    sut = new RegisterUserUseCase(inMemoryUserRepository, fakeHasher)
  })

  it('should be able to register a new user', async () => {
    const result = await sut.execute({ name: 'John', email: 'john@example.com', password: '123456' })

    expect(result.isRight()).toBe(true)
  })
})
```

### What to test

- Happy path — `isRight()` and shape of the success value
- Each error case — `isLeft()` and `toBeInstanceOf(SpecificError)`
- Side effects — assert state on the in-memory repository after execution