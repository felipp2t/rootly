import { app } from './app.ts'
import { env } from './infra/env/index.ts'
import { ensureMinioBucket } from './infra/storage/minio/minio.ts'

export async function start() {
  try {
    await ensureMinioBucket()
    app
      .listen({ port: env.PORT, host: '0.0.0.0' })
      .then(() => console.info('Server started successfully'))
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
