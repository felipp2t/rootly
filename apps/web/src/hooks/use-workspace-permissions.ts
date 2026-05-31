import type {
  GetMyWorkspacePermissions200PermissionsItemAction,
  GetMyWorkspacePermissions200PermissionsItemResource,
} from '@/api/model'
import {
  getGetMyWorkspacePermissionsQueryKey,
  useGetMyWorkspacePermissionsSuspense,
} from '@/api/me/me'

export type PermissionResource =
  GetMyWorkspacePermissions200PermissionsItemResource
export type PermissionAction =
  GetMyWorkspacePermissions200PermissionsItemAction

export { getGetMyWorkspacePermissionsQueryKey }

export function useWorkspacePermissions(workspaceId: string) {
  const { data } = useGetMyWorkspacePermissionsSuspense(workspaceId)
  const permissions = data.status === 200 ? data.data.permissions : []

  function can(resource: PermissionResource, action: PermissionAction): boolean {
    return permissions.some(
      (p) =>
        p.resource === resource &&
        (p.action === action || p.action === 'all'),
    )
  }

  return { can, permissions }
}
