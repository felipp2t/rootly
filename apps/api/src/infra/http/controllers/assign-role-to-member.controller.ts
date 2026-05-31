import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeAssignRoleToMemberUseCase } from '../factories/make-assign-role-to-member-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const assignRoleToMemberController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.patch(
    '/workspaces/:workspaceId/members/:memberId/role',
    {
      schema: {
        summary: 'Assign Role To Member',
        description: "Assign or change a workspace member's role",
        operationId: 'assignRoleToMember',
        tags: ['Members'],
        params: z.object({
          workspaceId: z.string(),
          memberId: z.string(),
        }),
        body: z.object({
          roleId: z.string(),
        }),
        response: {
          204: z.undefined(),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
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

      const { workspaceId, memberId } = request.params
      const { roleId } = request.body

      const useCase = makeAssignRoleToMemberUseCase()
      const result = await useCase.execute({
        userId: payload.userId,
        workspaceId,
        memberId,
        roleId,
      })

      if (result.isLeft()) {
        const error = result.value
        switch (error.constructor.name) {
          case 'ResourceNotFoundError':
            return reply.status(404).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
