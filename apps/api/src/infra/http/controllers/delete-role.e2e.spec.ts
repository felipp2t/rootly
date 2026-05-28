import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('DELETE /workspaces/:workspaceId/roles/:roleId', () => {
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

  async function createUserAndAuthenticate() {
    const accountResponse = await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      },
    })

    const { userId } = accountResponse.json<{ userId: string }>()

    const sessionResponse = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { email: 'john@example.com', password: '123456' },
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

  async function createRole(cookieHeader: string, workspaceId: string, name: string) {
    const roleResponse = await app.inject({
      method: 'POST',
      url: `/api/workspaces/${workspaceId}/roles`,
      headers: { cookie: cookieHeader },
      payload: { name },
    })

    const { roleId } = roleResponse.json<{ roleId: string }>()

    return roleId
  }

  it('should delete a role and return 204', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(cookieHeader)
    const roleId = await createRole(cookieHeader, workspaceId, 'Editor')

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/workspaces/${workspaceId}/roles/${roleId}`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(204)
  })

  it('should return 404 when the role does not exist', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(cookieHeader)

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/workspaces/${workspaceId}/roles/non-existent-role-id`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: expect.any(String) })
  })

  it('should return 404 when the workspace does not exist', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/workspaces/non-existent-workspace-id/roles/any-role-id',
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: expect.any(String) })
  })

  it('should return 404 when the user is not a member of the workspace', async () => {
    const { cookieHeader: firstCookieHeader } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(firstCookieHeader)
    const roleId = await createRole(firstCookieHeader, workspaceId, 'Editor')

    await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: '123456',
      },
    })

    const secondSessionResponse = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { email: 'jane@example.com', password: '123456' },
    })

    const setCookieHeader = secondSessionResponse.headers['set-cookie']
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader]
    const secondCookieHeader = cookies.map((c) => c?.split(';')[0]).join('; ')

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/workspaces/${workspaceId}/roles/${roleId}`,
      headers: { cookie: secondCookieHeader },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: expect.any(String) })
  })

  it('should return 401 when no access token cookie is present', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/workspaces/any-workspace-id/roles/any-role-id',
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toMatchObject({ message: 'Unauthorized' })
  })
})
