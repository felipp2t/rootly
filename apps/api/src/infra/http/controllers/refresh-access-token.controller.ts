import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeRefreshAccessTokenUseCase } from '../factories/make-refresh-access-token-use-case.ts'

export const refreshAccessTokenController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.post(
    '/sessions/refresh',
    {
      schema: {
        summary: 'Refresh Access Token',
        description: 'Exchange a valid refresh token for a new access token and refresh token',
        operationId: 'refreshAccessToken',
        tags: ['Auth'],
        body: z.object({
          refreshToken: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body

      const refreshAccessTokenUseCase = makeRefreshAccessTokenUseCase()

      const result = await refreshAccessTokenUseCase.execute({
        token: refreshToken,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'InvalidRefreshTokenError':
            return reply.status(401).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      const { accessToken, refreshToken: newRefreshToken } = result.value

      return reply.status(200).send({ accessToken, refreshToken: newRefreshToken })
    },
  )
}
