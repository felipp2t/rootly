import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeAuthenticateUserUseCase } from '../factories/make-authenticate-user-use-case.ts'

export const authenticateUserController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.post(
    '/sessions',
    {
      schema: {
        summary: 'Authenticate User',
        description: 'Authenticate a user and return a JWT token',
        operationId: 'authenticateUser',
        tags: ['Auth'],
        body: z.object({
          email: z.email(),
          password: z.string().min(6),
        }),
        response: {
          201: z.object({ accessToken: z.string(), refreshToken: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const authenticateUserUseCase = makeAuthenticateUserUseCase()

      const result = await authenticateUserUseCase.execute({
        email,
        password,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'WrongCredentialsError':
            return reply.status(401).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      const { accessToken, refreshToken } = result.value

      return reply.status(201).send({ accessToken, refreshToken })
    },
  )
}
