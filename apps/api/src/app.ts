import cors from '@fastify/cors'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { authenticateUserController } from './infra/http/controllers/authenticate-user.controller.ts'
import { createAccountController } from './infra/http/controllers/create-account.controller.ts'
import { createFolderController } from './infra/http/controllers/create-folder.controller.ts'
import { createItemsController } from './infra/http/controllers/create-item.controller.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

await app.register(cors, {
  origin: 'http://localhost:3000',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/health', async () => {
  return { status: 'ok' }
})

app.register(createAccountController)
app.register(authenticateUserController)
app.register(createFolderController)
app.register(createItemsController)

export { app }
