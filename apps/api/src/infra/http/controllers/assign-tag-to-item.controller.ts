import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeAssignTagToItemUseCase } from '../factories/make-assign-tag-to-item-use-case.ts'

export const assignTagToItemController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.patch(
    '/items/:itemId/tags/:tagId',
    {
      schema: {
        summary: 'Assign Tag to Item',
        description: 'Assign an existing tag to an item',
        operationId: 'assignTagToItem',
        tags: ['Items', 'Tags'],
        params: z.object({
          itemId: z.string(),
          tagId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { itemId, tagId } = request.params

      const useCase = makeAssignTagToItemUseCase()
      const result = await useCase.execute({ itemId, tagId })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'ItemNotFoundError':
          case 'TagNotFoundError':
            return reply.status(404).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
