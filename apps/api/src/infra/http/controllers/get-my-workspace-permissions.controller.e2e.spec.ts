import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('GET /workspaces/:workspaceId/me/permissions', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.refreshTokens)
    await db.delete(schema.items)
    await db.delete(schema.folders)
    await db.delete(schema.workspaceMembers)
    await db.delete(schema.workspaceInvites)
    await db.delete(schema.rolePermissions)
    await db.delete(schema.workspaceRoles)
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  async function createUserAndAuthenticate(
    name: string,
    email: string,
    password: string,
  ) {
    const accountResponse = await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: { name, email, password },
    })

    const { userId } = accountResponse.json<{ userId: string }>()

    const sessionResponse = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { email, password },
    })

    const setCookieHeader = sessionResponse.headers['set-cookie']
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader]
    const cookieHeader = cookies.map((c) => c?.split(';')[0]).join('; ')

    return { userId, cookieHeader }
  }

  async function createWorkspace(cookieHeader: string) {
    const workspaceResponse = await app.inject({
      method: 'POST',
      url: '/api/workspaces',
      headers: { cookie: cookieHeader },
      payload: { name: 'My Workspace' },
    })

    const { workspaceId } = workspaceResponse.json<{ workspaceId: string }>()

    return workspaceId
  }

  async function createRole(
    cookieHeader: string,
    workspaceId: string,
    name: string,
  ) {
    const roleResponse = await app.inject({
      method: 'POST',
      url: `/api/workspaces/${workspaceId}/roles`,
      headers: { cookie: cookieHeader },
      payload: { name },
    })

    const { roleId } = roleResponse.json<{ roleId: string }>()

    return roleId
  }

  it('should return 200 with permissions when user is a member with a role that has permissions', async () => {
    const { cookieHeader: ownerCookieHeader } = await createUserAndAuthenticate(
      'John Doe',
      'john@example.com',
      '123456',
    )
    const workspaceId = await createWorkspace(ownerCookieHeader)
    const roleId = await createRole(ownerCookieHeader, workspaceId, 'Editor')

    await app.inject({
      method: 'PUT',
      url: `/api/workspaces/${workspaceId}/roles/${roleId}/permissions`,
      headers: { cookie: ownerCookieHeader },
      payload: {
        permissions: [
          { resource: 'folder', action: 'read' },
          { resource: 'item', action: 'create' },
        ],
      },
    })

    const { userId: memberId, cookieHeader: memberCookieHeader } =
      await createUserAndAuthenticate('Jane Doe', 'jane@example.com', '123456')

    await db.insert(schema.workspaceMembers).values({
      userId: memberId,
      workspaceId,
      roleId,
    })

    const response = await app.inject({
      method: 'GET',
      url: `/api/workspaces/${workspaceId}/me/permissions`,
      headers: { cookie: memberCookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      permissions: expect.arrayContaining([
        expect.objectContaining({ resource: 'folder', action: 'read' }),
        expect.objectContaining({ resource: 'item', action: 'create' }),
      ]),
    })
    expect(response.json().permissions).toHaveLength(2)
  })

  it('should return 200 with empty permissions when user is the workspace owner but has no member row', async () => {
    const { cookieHeader } = await createUserAndAuthenticate(
      'John Doe',
      'john@example.com',
      '123456',
    )
    const workspaceId = await createWorkspace(cookieHeader)

    // Remove the auto-created member row so the owner has no role assignment,
    // exercising the code path that returns an empty permissions list.
    await db.delete(schema.workspaceMembers)

    const response = await app.inject({
      method: 'GET',
      url: `/api/workspaces/${workspaceId}/me/permissions`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ permissions: [] })
  })

  it('should return 401 when no access token cookie is present', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/workspaces/any-workspace-id/me/permissions',
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toMatchObject({ message: 'Unauthorized' })
  })

  it('should return 404 when the workspace does not exist', async () => {
    const { cookieHeader } = await createUserAndAuthenticate(
      'John Doe',
      'john@example.com',
      '123456',
    )

    const response = await app.inject({
      method: 'GET',
      url: '/api/workspaces/non-existent-workspace-id/me/permissions',
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: expect.any(String) })
  })
})
