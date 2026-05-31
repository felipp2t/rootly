import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

export const permissionResource = [
  'workspace',
  'folder',
  'item',
  'tag',
  'member',
  'role',
] as const

export type PermissionResource = (typeof permissionResource)[number]

export const permissionAction = [
  'create',
  'read',
  'update',
  'delete',
  'invite',
  'all',
] as const

export type PermissionAction = (typeof permissionAction)[number]

/**
 * Permission combinations that are not meaningful in the domain.
 * Workspaces are created freely by any user (a workspace models a company,
 * and a user may belong to many), so `workspace:create` cannot be gated by
 * a role and is disallowed.
 */
export const disallowedPermissions: {
  resource: PermissionResource
  action: PermissionAction
}[] = [{ resource: 'workspace', action: 'create' }]

export function isPermissionAllowed(
  resource: PermissionResource,
  action: PermissionAction,
): boolean {
  return !disallowedPermissions.some(
    (p) => p.resource === resource && p.action === action,
  )
}

type PermissionPair = { resource: PermissionResource; action: PermissionAction }

/** All non-`all` actions that are meaningful for a given resource. */
function validGranularActions(
  resource: PermissionResource,
): PermissionAction[] {
  return permissionAction.filter(
    (action) => action !== 'all' && isPermissionAllowed(resource, action),
  )
}

function groupByResource(
  pairs: PermissionPair[],
): Map<PermissionResource, Set<PermissionAction>> {
  const map = new Map<PermissionResource, Set<PermissionAction>>()
  for (const { resource, action } of pairs) {
    const actions = map.get(resource) ?? new Set<PermissionAction>()
    actions.add(action)
    map.set(resource, actions)
  }
  return map
}

function normalizeResourceActions(
  resource: PermissionResource,
  current: Set<PermissionAction>,
  incoming: Set<PermissionAction>,
): Set<PermissionAction> {
  const hadAll = current.has('all')
  const hasAll = incoming.has('all')
  const granular = new Set(
    [...incoming].filter((action) => action !== 'all'),
  )

  // Rule 3: the user just checked `all` → keep only `all`.
  if (hasAll && !hadAll) {
    return new Set<PermissionAction>(['all'])
  }

  let result: Set<PermissionAction>
  if (hasAll && hadAll && granular.size > 0) {
    // Rule 1: `all` was already set and the user added a granular action →
    // drop `all`, keep only the granular ones.
    result = granular
  } else if (hasAll) {
    // `all` unchanged with no granular additions.
    return new Set<PermissionAction>(['all'])
  } else {
    result = granular
  }

  // Rule 2 (takes precedence): every valid granular action is set → collapse
  // back to `all`.
  const valid = validGranularActions(resource)
  if (valid.length > 0 && valid.every((action) => result.has(action))) {
    return new Set<PermissionAction>(['all'])
  }

  return result
}

/**
 * Reconciles the incoming permission set against what is currently stored,
 * applying the `all` super-action rules per resource. The `setRolePermissions`
 * payload is a full replacement, so resources absent from `incoming` are
 * dropped (they are simply not present in the result).
 */
export function normalizePermissions(
  current: PermissionPair[],
  incoming: PermissionPair[],
): PermissionPair[] {
  const currentByResource = groupByResource(current)
  const incomingByResource = groupByResource(incoming)

  const result: PermissionPair[] = []
  for (const [resource, incomingActions] of incomingByResource) {
    const currentActions =
      currentByResource.get(resource) ?? new Set<PermissionAction>()
    const normalized = normalizeResourceActions(
      resource,
      currentActions,
      incomingActions,
    )
    for (const action of normalized) {
      result.push({ resource, action })
    }
  }
  return result
}

export interface RolePermissionProps {
  roleId: string
  resource: PermissionResource
  action: PermissionAction
  createdAt: Date
  updatedAt: Date
}

export class RolePermission extends Entity<RolePermissionProps> {
  get roleId() {
    return this.props.roleId
  }

  get resource() {
    return this.props.resource
  }

  get action() {
    return this.props.action
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(
    props: Optional<RolePermissionProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    return new RolePermission(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
