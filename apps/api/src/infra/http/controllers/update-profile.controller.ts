import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeUpdateProfileUseCase } from '../factories/make-update-profile-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const updateProfileController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.patch(
    '/me',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Update Profile',
        description: 'Update the authenticated user profile',
        operationId: 'updateProfile',
        tags: ['Me'],
        body: z.object({
          name: z.string().min(3),
        }),
        response: {
          204: z.null(),
          400: z.object({ message: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name } = request.body

      const updateProfileUseCase = makeUpdateProfileUseCase()
      const result = await updateProfileUseCase.execute({
        userId: request.userId,
        name,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'InvalidProfileNameError':
            return reply.status(400).send({ message: error.message })
          default:
            return reply.status(401).send({ message: 'Unauthorized' })
        }
      }

      return reply.status(204).send(null)
    },
  )
}
