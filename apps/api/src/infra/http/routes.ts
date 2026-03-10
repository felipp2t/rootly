import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { assignTagToFolderController } from './controllers/assign-tag-to-folder.controller.ts'
import { assignTagToItemController } from './controllers/assign-tag-to-item.controller.ts'
import { authenticateUserController } from './controllers/authenticate-user.controller.ts'
import { createAccountController } from './controllers/create-account.controller.ts'
import { createFolderController } from './controllers/create-folder.controller.ts'
import { createItemsController } from './controllers/create-item.controller.ts'
import { createTagController } from './controllers/create-tag.controller.ts'
import { createWorkspaceController } from './controllers/create-workspace.controller.ts'
import { getFoldersController } from './controllers/get-folders.controller.ts'
import { getItemsController } from './controllers/get-items.controller.ts'
import { refreshAccessTokenController } from './controllers/refresh-access-token.controller.ts'

export const routes: FastifyPluginCallbackZod = async (app) => {
  app.register(authenticateUserController)
  app.register(refreshAccessTokenController)
  app.register(createAccountController)
  app.register(createFolderController)
  app.register(createItemsController)
  app.register(createTagController)
  app.register(createWorkspaceController)
  app.register(assignTagToFolderController)
  app.register(assignTagToItemController)
  app.register(getFoldersController)
  app.register(getItemsController)
}