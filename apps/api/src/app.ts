import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
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
