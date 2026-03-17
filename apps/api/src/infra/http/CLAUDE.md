# HTTP Layer

Fastify controllers and factories. This layer is responsible for receiving HTTP requests, validating input, calling use cases, and mapping results to HTTP responses.

## Controllers

Controllers are Fastify plugins typed as `FastifyPluginCallbackZod` (from `fastify-type-provider-zod`). Each controller registers one route.

### Structure

```typescript
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeSomeUseCase } from '../factories/make-some-use-case.ts'

export const someController: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/route',
    {
      schema: {
        summary: 'Short title',
        description: 'Longer description',
        operationId: 'someAction',
        tags: ['TagName'],
        body: z.object({
          field: z.string(),
        }),
        response: {
          201: z.object({ id: z.string() }),
          400: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { field } = request.body

      const useCase = makeSomeUseCase()
      const result = await useCase.execute({ field })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'SomeSpecificError':
            return reply.status(409).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(201).send(result.value)
    },
  )
}
```

### Conventions

- One file per controller, named `<action>-<resource>.controller.ts`.
- The exported variable name matches the file: `createFolderController`, `registerUserController`, etc.
- Always instantiate the use case **inside the handler** via the factory — never at module level.
- Use a `switch` on `error.constructor.name` to map domain errors to HTTP status codes.
- Always include a `default` case returning `500`.
- Input validation is done by Zod in the `schema` — do not repeat it manually in the handler.
- Always declare `operationId` (camelCase) and `response` schemas in every route's `schema` object.

### Protected Routes (JWT)

Routes that require authentication must manually verify the JWT from the `accessToken` cookie using `verifyJwt` from `../verify-jwt.ts`. There is no Fastify hook/decorator — each protected handler does this explicitly at the top.

```typescript
import { verifyJwt } from '../verify-jwt.ts'

// inside handler:
const token = request.cookies.accessToken

if (!token) {
  return reply.status(401).send({ message: 'Unauthorized' })
}

const payload = await verifyJwt(token)

if (!payload) {
  return reply.status(401).send({ message: 'Unauthorized' })
}

// payload.userId is now available
```

`verifyJwt` returns `{ userId: string } | null` (extracted from `payload.sub`). Use `payload.userId` to pass the caller's identity to the use case when needed.

Always include `401: z.object({ message: z.string() })` in the `response` schema of protected routes.

### Auth Token Conventions

- Tokens are stored in **HTTP-only cookies**, never in the response body.
- `accessToken` cookie: `maxAge: 60 * 15` (15 minutes).
- `refreshToken` cookie: no `maxAge` (session-scoped).
- Both cookies use `httpOnly: true, secure: true, sameSite: 'strict', path: '/'`.
- Setting cookies (login / refresh):

```typescript
return reply
  .setCookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15,
  })
  .setCookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  })
  .status(201)
  .send({})
```

### Public vs Protected routes

| Route | Protected |
|-------|-----------|
| `POST /sessions` | No |
| `POST /sessions/refresh` | No (uses `refreshToken` cookie directly) |
| `POST /accounts` | No |
| All other routes | Yes — verify `accessToken` cookie |

### Error → HTTP Status mapping

| Scenario | Status |
|----------|--------|
| Resource already exists | `409 Conflict` |
| Invalid input / business rule violation | `400 Bad Request` |
| Wrong credentials / unauthorized | `401 Unauthorized` |
| Not found | `404 Not Found` |
| Unhandled / unknown error | `500 Internal Server Error` |

## Factories

Factories are plain functions that wire concrete implementations to use case constructors. They are the only place where infra classes (repositories, hashers, encrypters) are instantiated.

### Structure

```typescript
import { SomeUseCase } from '@/domain/root/application/use-cases/some-use-case.ts'
import { ArgonHasher } from '@/infra/cryptography/argon-hasher.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleSomeRepository } from '@/infra/db/drizzle/repositories/some-repository.ts'

export function makeSomeUseCase() {
  const repository = new DrizzleSomeRepository(db)
  const hasher = new ArgonHasher()
  const useCase = new SomeUseCase(repository, hasher)
  return useCase
}
```

### Conventions

- One file per use case, named `make-<use-case-name>.ts`.
- Always pass `db` (the Drizzle client) to repository constructors.
- For auth use cases, pass `ArgonHasher` for hashing and `JwtEncrypter` for token generation.
