import type {
  GetRolePermissions200PermissionsItemAction,
  GetRolePermissions200PermissionsItemResource,
} from '@/api/model'

export type Resource = GetRolePermissions200PermissionsItemResource
export type Action = GetRolePermissions200PermissionsItemAction
export type Permissions = Record<Resource, Partial<Record<Action, boolean>>>

export const RESOURCES = [
  'workspace',
  'folder',
  'item',
  'tag',
  'member',
  'role',
] as const

export const ACTIONS = [
  'read',
  'create',
  'update',
  'delete',
  'invite',
  'all',
] as const

// Combinations that are not meaningful in the domain. Workspaces are created
// freely by any user, so `workspace:create` cannot be gated by a role.
const DISALLOWED_PERMISSIONS: { resource: Resource; action: Action }[] = [
  { resource: 'workspace', action: 'create' },
]

export function isPermissionAllowed(
  resource: Resource,
  action: Action,
): boolean {
  return !DISALLOWED_PERMISSIONS.some(
    (p) => p.resource === resource && p.action === action,
  )
}

export function toMatrix(
  permissions: { resource: Resource; action: Action }[],
): Permissions {
  const matrix = {} as Permissions
  for (const { resource, action } of permissions) {
    if (!matrix[resource]) matrix[resource] = {}
    matrix[resource][action] = true
  }
  return matrix
}

export function fromMatrix(
  matrix: Permissions,
): { resource: Resource; action: Action }[] {
  return Object.entries(matrix).flatMap(([resource, actions]) =>
    Object.entries(actions ?? {})
      .filter(([, v]) => v)
      .map(([action]) => ({
        resource: resource as Resource,
        action: action as Action,
      }))
      .filter(({ resource, action }) => isPermissionAllowed(resource, action)),
  )
}
