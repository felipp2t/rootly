import type { MultipartValue } from '@fastify/multipart'
import { validatorCompiler as zodValidatorCompiler } from 'fastify-type-provider-zod'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeCreateItemUseCase } from '../factories/make-create-item-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

function getStringField(field: unknown): string | undefined {
  if (field && typeof field === 'object' && 'value' in field) {
    const value = (field as MultipartValue).value
    return typeof value === 'string' ? value : undefined
  }
  return undefined
}

export const uploadItemController: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/items/upload',
    {
      validatorCompiler: (opts) =>
        opts.httpPart === 'body'
          ? () => ({ value: undefined })
          : zodValidatorCompiler(opts),
      schema: {
        summary: 'Upload Item',
        description:
          'Create a document item by uploading a file via multipart/form-data',
        operationId: 'uploadItem',
        tags: ['Items'],
        consumes: ['multipart/form-data'],
        body: z.object({
          title: z.string(),
          workspaceId: z.string(),
          folderId: z.string().optional(),
          file: z.file(),
        }),
        response: {
          201: z.object({ itemId: z.string() }),
          400: z.object({ message: z.string() }),
          401: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
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

      const data = await request.file()

      if (!data) {
        return reply.status(400).send({ message: 'No file uploaded' })
      }

      const fileBuffer = await data.toBuffer()
      const fileName = data.filename

      const title = getStringField(data.fields.title)
      const workspaceId = getStringField(data.fields.workspaceId)
      const folderId = getStringField(data.fields.folderId)

      if (!title || !workspaceId) {
        return reply
          .status(400)
          .send({ message: 'Missing required fields: title, workspaceId' })
      }

      const useCase = makeCreateItemUseCase()

      const result = await useCase.execute({
        workspaceId,
        folderId,
        title,
        type: 'document',
        fileBuffer,
        fileName,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'ItemAlreadyExistsError':
            return reply.status(409).send({ message: error.message })
          case 'InvalidItemTitleError':
            return reply.status(400).send({ message: error.message })
          case 'InvalidItemTypeError':
            return reply.status(400).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(201).send({ itemId: result.value.itemId })
    },
  )
}
