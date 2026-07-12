---
name: http-layer
description: Conventions for Fastify controllers and factories in the Rootly API (apps/api/src/infra/http). Covers route/controller structure with Zod schemas, JWT/cookie auth, error-to-HTTP-status mapping, and the factory pattern for wiring concrete repository implementations into use cases. Use when creating or modifying a controller or a factory.
---

# HTTP Layer

Fastify controllers and factories. This layer is responsible for receiving HTTP requests,
validating input, calling use cases, and mapping results to HTTP responses.

## Controllers

Controllers are Fastify plugins typed as `FastifyPluginCallbackZod` (from
`fastify-type-provider-zod`). Each controller registers one route.

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
- The exported variable name matches the file: `createFolderController`, `registerUserController`,
  etc.
- Always instantiate the use case **inside the handler** via the factory — never at module level.
- Use a `switch` on `error.constructor.name` to map domain errors to HTTP status codes.
- Always include a `default` case returning `500`.
- Input validation is done by Zod in the `schema` — do not repeat it manually in the handler.
- Always declare `operationId` (camelCase) and `response` schemas in every route's `schema`
  object.

### Protected Routes (JWT)

Protected routes use the `verifyJwtHook` from `../middleware/verify-jwt-hook.ts` as the route's
`onRequest` hook, which decorates `request.userId` from the `accessToken` cookie.

```typescript
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

app.post(
  '/route',
  {
    onRequest: verifyJwtHook,
    schema: { /* ... */ },
  },
  async (request, reply) => {
    // request.userId is now available
  },
)
```

Always include `401: z.object({ message: z.string() })` in the `response` schema of protected
routes.

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
| All other routes | Yes — `onRequest: verifyJwtHook` |

### Error → HTTP Status mapping

| Scenario | Status |
|----------|--------|
| Resource already exists | `409 Conflict` |
| Invalid input / business rule violation | `400 Bad Request` |
| Wrong credentials / unauthorized | `401 Unauthorized` |
| Missing permission (RBAC) | `403 Forbidden` |
| Not found | `404 Not Found` |
| Unhandled / unknown error | `500 Internal Server Error` |

## Factories

Factories are plain functions that wire concrete implementations to use case constructors. They
are the only place where infra classes (repositories, hashers, encrypters) are instantiated.

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
- A domain-event subscriber that needs raw repositories beyond `RecordActivityLogUseCase` gets
  its own `make-on-<resource>-activity.ts` factory; otherwise it's instantiated directly in
  `src/infra/events/register-subscribers.ts`.
