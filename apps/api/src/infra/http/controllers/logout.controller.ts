import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeLogoutUseCase } from '../factories/make-logout-use-case.ts'

export const logoutController: FastifyPluginCallbackZod = async (app) => {
  app.delete(
    '/sessions',
    {
      schema: {
        summary: 'Logout',
        description: 'Invalidate the current session',
        operationId: 'logout',
        tags: ['Auth'],
        response: {
          204: z.null(),
          401: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const refreshToken = request.cookies.refreshToken

      if (!refreshToken) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const logoutUseCase = makeLogoutUseCase()
      const result = await logoutUseCase.execute({ refreshToken })

      if (result.isLeft()) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      return reply
        .clearCookie('accessToken', { path: '/' })
        .clearCookie('refreshToken', { path: '/' })
        .status(204)
        .send(null)
    },
  )
}
