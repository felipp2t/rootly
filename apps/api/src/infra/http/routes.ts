import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { acceptInviteController } from './controllers/accept-invite.controller.ts'
import { assignRoleToMemberController } from './controllers/assign-role-to-member.controller.ts'
import { assignTagToFolderController } from './controllers/assign-tag-to-folder.controller.ts'
import { authenticateUserController } from './controllers/authenticate-user.controller.ts'
import { logoutController } from './controllers/logout.controller.ts'
import { changePasswordController } from './controllers/change-password.controller.ts'
import { createAccountController } from './controllers/create-account.controller.ts'
import { createFolderController } from './controllers/create-folder.controller.ts'
import { createItemsController } from './controllers/create-item.controller.ts'
import { createRoleController } from './controllers/create-role.controller.ts'
import { createTagController } from './controllers/create-tag.controller.ts'
import { createWorkspaceController } from './controllers/create-workspace.controller.ts'
import { createWsTicketController } from './controllers/create-ws-ticket.controller.ts'
import { declineInviteController } from './controllers/decline-invite.controller.ts'
import { deleteRoleController } from './controllers/delete-role.controller.ts'
import { deleteWorkspaceController } from './controllers/delete-workspace.controller.ts'
import { getFoldersController } from './controllers/get-folders.controller.ts'
import { getItemsController } from './controllers/get-items.controller.ts'
import { getMeController } from './controllers/get-me.controller.ts'
import { getMyWorkspacePermissionsController } from './controllers/get-my-workspace-permissions.controller.ts'
import { getNotificationsController } from './controllers/get-notifications.controller.ts'
import { getRolePermissionsController } from './controllers/get-role-permissions.controller.ts'
import { getRolesController } from './controllers/get-roles.controller.ts'
import { getWorkspaceController } from './controllers/get-workspace.controller.ts'
import { getWorkspaceInvitesController } from './controllers/get-workspace-invites.controller.ts'
import { getWorkspaceMembersController } from './controllers/get-workspace-members.controller.ts'
import { getWorkspacesController } from './controllers/get-workspaces.controller.ts'
import { inviteUserController } from './controllers/invite-user.controller.ts'
import { notificationsWebSocketController } from './controllers/notifications-websocket.controller.ts'
import { readNotificationController } from './controllers/read-notification.controller.ts'
import { refreshAccessTokenController } from './controllers/refresh-access-token.controller.ts'
import { removeMemberController } from './controllers/remove-member.controller.ts'
import { resolveFolderPathController } from './controllers/resolve-folder-path.controller.ts'
import { revokeInviteController } from './controllers/revoke-invite.controller.ts'
import { setRolePermissionsController } from './controllers/set-role-permissions.controller.ts'
import { updateProfileController } from './controllers/update-profile.controller.ts'
import { updateWorkspaceController } from './controllers/update-workspace.controller.ts'
import { uploadItemController } from './controllers/upload-item.controller.ts'

export const routes: FastifyPluginCallbackZod = async (app) => {
  app.register(authenticateUserController)
  app.register(logoutController)
  app.register(refreshAccessTokenController)
  app.register(getMeController)
  app.register(updateProfileController)
  app.register(changePasswordController)
  app.register(getMyWorkspacePermissionsController)
  app.register(createAccountController)
  app.register(createFolderController)
  app.register(createItemsController)
  app.register(uploadItemController)
  app.register(createTagController)
  app.register(createWorkspaceController)
  app.register(updateWorkspaceController)
  app.register(deleteWorkspaceController)
  app.register(assignTagToFolderController)
  app.register(getFoldersController)
  app.register(resolveFolderPathController)
  app.register(getItemsController)
  app.register(getWorkspacesController)
  app.register(getWorkspaceController)
  app.register(getWorkspaceMembersController)
  app.register(assignRoleToMemberController)
  app.register(removeMemberController)
  app.register(inviteUserController)
  app.register(getWorkspaceInvitesController)
  app.register(acceptInviteController)
  app.register(declineInviteController)
  app.register(revokeInviteController)
  app.register(getNotificationsController)
  app.register(readNotificationController)
  app.register(createWsTicketController)
  app.register(notificationsWebSocketController)
  app.register(getRolesController)
  app.register(createRoleController)
  app.register(deleteRoleController)
  app.register(getRolePermissionsController)
  app.register(setRolePermissionsController)
}
