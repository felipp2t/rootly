import cors from '@fastify/cors'
import { fastify } from 'fastify'

const app = fastify({ logger: true })

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
})

app.get('/health', async () => {
  return { status: 'ok' }
})

const port = Number(process.env.PORT) || 3001
const host = process.env.HOST ?? '0.0.0.0'

try {
  await app.listen({ port, host })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
