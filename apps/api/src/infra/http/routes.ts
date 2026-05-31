import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { assignTagToFolderController } from './controllers/assign-tag-to-folder.controller.ts'
import { assignTagToItemController } from './controllers/assign-tag-to-item.controller.ts'
import { authenticateUserController } from './controllers/authenticate-user.controller.ts'
import { createAccountController } from './controllers/create-account.controller.ts'
import { createFolderController } from './controllers/create-folder.controller.ts'
import { createItemsController } from './controllers/create-item.controller.ts'
import { createRoleController } from './controllers/create-role.controller.ts'
import { createTagController } from './controllers/create-tag.controller.ts'
import { createWorkspaceController } from './controllers/create-workspace.controller.ts'
import { deleteRoleController } from './controllers/delete-role.controller.ts'
import { getFoldersController } from './controllers/get-folders.controller.ts'
import { getItemsController } from './controllers/get-items.controller.ts'
import { getMeController } from './controllers/get-me.controller.ts'
import { getMyWorkspacePermissionsController } from './controllers/get-my-workspace-permissions.controller.ts'
import { getRolePermissionsController } from './controllers/get-role-permissions.controller.ts'
import { getRolesController } from './controllers/get-roles.controller.ts'
import { getWorkspaceController } from './controllers/get-workspace.controller.ts'
import { getWorkspacesController } from './controllers/get-workspaces.controller.ts'
import { refreshAccessTokenController } from './controllers/refresh-access-token.controller.ts'
import { resolveFolderPathController } from './controllers/resolve-folder-path.controller.ts'
import { setRolePermissionsController } from './controllers/set-role-permissions.controller.ts'
import { uploadItemController } from './controllers/upload-item.controller.ts'

export const routes: FastifyPluginCallbackZod = async (app) => {
  app.register(authenticateUserController)
  app.register(refreshAccessTokenController)
  app.register(getMeController)
  app.register(getMyWorkspacePermissionsController)
  app.register(createAccountController)
  app.register(createFolderController)
  app.register(createItemsController)
  app.register(uploadItemController)
  app.register(createTagController)
  app.register(createWorkspaceController)
  app.register(assignTagToFolderController)
  app.register(assignTagToItemController)
  app.register(getFoldersController)
  app.register(resolveFolderPathController)
  app.register(getItemsController)
  app.register(getWorkspacesController)
  app.register(getWorkspaceController)
  app.register(getRolesController)
  app.register(createRoleController)
  app.register(deleteRoleController)
  app.register(getRolePermissionsController)
  app.register(setRolePermissionsController)
}
