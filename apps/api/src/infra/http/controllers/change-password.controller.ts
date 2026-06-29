import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeChangePasswordUseCase } from '../factories/make-change-password-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const changePasswordController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.patch(
    '/me/password',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Change Password',
        description: 'Change the authenticated user password',
        operationId: 'changePassword',
        tags: ['Me'],
        body: z
          .object({
            currentPassword: z.string().min(1),
            newPassword: z.string().min(8),
            confirmPassword: z.string().min(8),
          })
          .refine((data) => data.newPassword === data.confirmPassword, {
            message: 'Passwords do not match',
            path: ['confirmPassword'],
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
      const { currentPassword, newPassword } = request.body

      const changePasswordUseCase = makeChangePasswordUseCase()
      const result = await changePasswordUseCase.execute({
        userId: request.userId,
        currentPassword,
        newPassword,
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

      return reply
        .clearCookie('accessToken', { path: '/' })
        .clearCookie('refreshToken', { path: '/' })
        .status(204)
        .send(null)
    },
  )
}
