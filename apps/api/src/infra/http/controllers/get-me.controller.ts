import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetMeUseCase } from '../factories/make-get-me-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

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
      const token = request.cookies.accessToken

      if (!token) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }
      const payload = await verifyJwt(token)

      if (!payload) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const getMeUseCase = makeGetMeUseCase()
      const result = await getMeUseCase.execute({ userId: payload.userId })

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
