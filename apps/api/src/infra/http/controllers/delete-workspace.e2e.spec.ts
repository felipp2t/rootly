import { eq } from 'drizzle-orm'
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /workspaces/:workspaceId/delete', () => {
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
    name = 'John Doe',
    email = 'john@example.com',
  ) {
    const accountResponse = await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: { name, email, password: '123456' },
    })

    const { userId } = accountResponse.json<{ userId: string }>()

    const sessionResponse = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { email, password: '123456' },
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

  it('should delete the workspace and return 204 when the owner requests it', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(cookieHeader)

    const response = await app.inject({
      method: 'POST',
      url: `/api/workspaces/${workspaceId}/delete`,
      headers: { cookie: cookieHeader },
      payload: { password: '123456' },
    })

    expect(response.statusCode).toBe(204)

    const rows = await db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, workspaceId))

    expect(rows).toHaveLength(0)
  })

  it('should cascade delete roles, permissions and members', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(cookieHeader)

    await app.inject({
      method: 'POST',
      url: `/api/workspaces/${workspaceId}/delete`,
      headers: { cookie: cookieHeader },
      payload: { password: '123456' },
    })

    const roles = await db
      .select()
      .from(schema.workspaceRoles)
      .where(eq(schema.workspaceRoles.workspaceId, workspaceId))
    const members = await db
      .select()
      .from(schema.workspaceMembers)
      .where(eq(schema.workspaceMembers.workspaceId, workspaceId))

    expect(roles).toHaveLength(0)
    expect(members).toHaveLength(0)
  })

  it('should return 403 when a non-owner member tries to delete the workspace', async () => {
    const { cookieHeader: ownerCookie } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(ownerCookie)

    const { userId: memberUserId, cookieHeader: memberCookie } =
      await createUserAndAuthenticate('Jane Doe', 'jane@example.com')

    const [role] = await db
      .insert(schema.workspaceRoles)
      .values({ workspaceId, name: 'Viewer' })
      .returning()

    await db
      .insert(schema.workspaceMembers)
      .values({ userId: memberUserId, workspaceId, roleId: role.id })

    const response = await app.inject({
      method: 'POST',
      url: `/api/workspaces/${workspaceId}/delete`,
      headers: { cookie: memberCookie },
      payload: { password: '123456' },
    })

    expect(response.statusCode).toBe(403)
    expect(response.json()).toMatchObject({ message: expect.any(String) })

    const rows = await db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, workspaceId))

    expect(rows).toHaveLength(1)
  })

  it('should return 404 when the workspace does not exist', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()

    const response = await app.inject({
      method: 'POST',
      url: '/api/workspaces/non-existent-workspace-id/delete',
      headers: { cookie: cookieHeader },
      payload: { password: '123456' },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: expect.any(String) })
  })

  it('should return 401 when no access token cookie is present', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/workspaces/any-workspace-id/delete',
      payload: { password: '123456' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toMatchObject({ message: 'Unauthorized' })
  })
})
