import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeDeleteItemUseCase } from '../factories/make-delete-item-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const deleteItemController: FastifyPluginCallbackZod = async (app) => {
  app.delete(
    '/items/:itemId',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Delete Item',
        description: 'Permanently delete an archived item',
        operationId: 'deleteItem',
        tags: ['Items'],
        params: z.object({
          itemId: z.string(),
        }),
        response: {
          204: z.undefined(),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { itemId } = request.params

      const useCase = makeDeleteItemUseCase()
      const result = await useCase.execute({
        itemId,
        actorId: request.userId,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'ItemNotFoundError':
            return reply.status(404).send({ message: error.message })
          case 'ItemNotArchivedError':
            return reply.status(409).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
