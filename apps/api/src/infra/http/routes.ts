import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
  import { authenticateUserController } from './controllers/authenticate-user.controller.ts'
  import { createAccountController } from './controllers/create-account.controller.ts'
  import { createFolderController } from './controllers/create-folder.controller.ts'
  import { createItemsController } from './controllers/create-item.controller.ts'

  export const routes: FastifyPluginCallbackZod = async (app) => {
    app.register(authenticateUserController)
    app.register(createAccountController)
    app.register(createFolderController)
    app.register(createItemsController)
  }