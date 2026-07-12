import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetMeUseCase } from '../factories/make-get-me-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const getMeController: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/me',
    {
      onRequest: verifyJwtHook,
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
      const getMeUseCase = makeGetMeUseCase()
      const result = await getMeUseCase.execute({ userId: request.userId })

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
