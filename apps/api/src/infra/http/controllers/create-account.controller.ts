import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeRegisterUserUseCase } from '../factories/make-register-user-use-case.ts'

export const createAccountController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.post(
    '/accounts',
    {
      schema: {
        summary: 'Register User',
        description: 'Register a new user',
        operationId: 'createAccount',
        tags: ['Auth'],
        body: z.object({
          name: z.string(),
          email: z.email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const registerUserUseCase = makeRegisterUserUseCase()

      const result = await registerUserUseCase.execute({
        email,
        name,
        password,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'UserAlreadyExistsError':
            return reply.status(409).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      const { userId } = result.value

      return reply.status(201).send({ userId })
    },
  )
}
