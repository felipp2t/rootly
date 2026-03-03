import cors from '@fastify/cors'
import { fastify } from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod"

const app = fastify().withTypeProvider<ZodTypeProvider>()

await app.register(cors, {
  origin: 'http://localhost:3000',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/health', async () => {
  return { status: 'ok' }
})

export { app }
