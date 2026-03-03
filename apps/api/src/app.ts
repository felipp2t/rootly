import cors from '@fastify/cors'
import { fastify } from 'fastify'

const app = fastify()

await app.register(cors, {
  origin: 'http://localhost:3000',
})

app.get('/health', async () => {
  return { status: 'ok' }
})

export { app }
