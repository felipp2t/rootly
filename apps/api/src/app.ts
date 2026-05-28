import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { routes } from './infra/http/routes.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

await app.register(cookie)
await app.register(multipart)

await app.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
})

await app.register(swagger, {
  openapi: {
    info: {
      title: 'Rootly API',
      version: '0.1.0',
    },
  },
  transform: jsonSchemaTransform,
  transformObject: (documentObject) => {
    if (!('openapiObject' in documentObject))
      return documentObject.swaggerObject

    const doc = documentObject.openapiObject

    for (const pathItem of Object.values(doc.paths ?? {})) {
      if (!pathItem) continue
      for (const value of Object.values(pathItem)) {
        if (!value || typeof value !== 'object' || !('requestBody' in value))
          continue
        const requestBody = value.requestBody
        if (!requestBody || '$ref' in requestBody) continue
        const multipart = requestBody.content?.['multipart/form-data']
        if (!multipart?.schema || '$ref' in multipart.schema) continue
        const properties = multipart.schema.properties
        if (properties?.file !== undefined) {
          properties.file = { type: 'string', format: 'binary' }
        }
      }
    }

    return doc
  },
})

await app.register(swaggerUi, {
  routePrefix: '/docs',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/health', async () => {
  return { status: 'ok' }
})

app.register(routes, { prefix: '/api' })

export { app }
