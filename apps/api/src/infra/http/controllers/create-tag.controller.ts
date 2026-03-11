import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeCreateTagUseCase } from '../factories/make-create-tag-use-case.ts'

export const createTagController: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/tags',
    {
      schema: {
        summary: 'Create Tag',
        description: 'Create a new tag',
        operationId: 'createTag',
        tags: ['Tags'],
        body: z.object({
          name: z.string(),
          color: z.enum(['blue', 'green', 'orange', 'purple', 'red', 'yellow']),
          workspaceId: z.string(),
        }),
        response: {
          201: z.object({ tagId: z.string() }),
          409: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name, color, workspaceId } = request.body

      const useCase = makeCreateTagUseCase()
      const result = await useCase.execute({ name, color, workspaceId })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'TagAlreadyExistsError':
            return reply.status(409).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(201).send({ tagId: result.value.tagId })
    },
  )
}
