import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { jwtVerify } from 'jose'
import { z } from 'zod'
import { env } from '@/infra/env/index.ts'
import { makeGetMeUseCase } from '../factories/make-get-me-use-case.ts'

export const getMeController: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/me',
    {
      schema: {
        summary: 'Get Me',
        description: 'Get the authenticated user information',
        operationId: 'getMe',
        tags: ['Me'],
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
          }),
          401: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const authHeader = request.headers.authorization

      if (!authHeader?.startsWith('Bearer ')) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const token = authHeader.slice(7)
      const secret = new TextEncoder().encode(env.JWT_SECRET)

      let userId: string

      try {
        const { payload } = await jwtVerify(token, secret)
        userId = payload.sub as string
      } catch {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const getMeUseCase = makeGetMeUseCase()
      const result = await getMeUseCase.execute({ userId })

      if (result.isLeft()) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const { user } = result.value

      return reply.status(200).send({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
      })
    },
  )
}
