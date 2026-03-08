import * as folderTags from './folder-tags.ts'
import * as folders from './folders.ts'
import * as itemTags from './item-tags.ts'
import * as items from './items.ts'
import * as rolePermissions from './role-permissions.ts'
import * as tags from './tags.ts'
import * as users from './users.ts'
import * as workspaceMembers from './workspace-members.ts'
import * as workspaceRoles from './workspace-roles.ts'
import * as workspaces from './workspaces.ts'

export const schema = {
  ...folderTags,
  ...folders,
  ...itemTags,
  ...items,
  ...rolePermissions,
  ...tags,
  ...users,
  ...workspaceMembers,
  ...workspaceRoles,
  ...workspaces,
}
