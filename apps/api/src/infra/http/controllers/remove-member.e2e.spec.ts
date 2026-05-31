import { eq } from 'drizzle-orm'
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('DELETE /workspaces/:workspaceId/members/:memberId', () => {
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

  it('should remove a member and return 204', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(cookieHeader)

    const [role] = await db
      .insert(schema.workspaceRoles)
      .values({ workspaceId, name: 'Viewer' })
      .returning()

    const [user] = await db
      .insert(schema.users)
      .values({
        name: 'Jane Doe',
        email: 'jane@example.com',
        passwordHash: 'hash',
      })
      .returning()

    const [member] = await db
      .insert(schema.workspaceMembers)
      .values({ userId: user.id, workspaceId, roleId: role.id })
      .returning()

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/workspaces/${workspaceId}/members/${member.id}`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(204)

    const rows = await db
      .select()
      .from(schema.workspaceMembers)
      .where(eq(schema.workspaceMembers.id, member.id))

    expect(rows).toHaveLength(0)
  })

  it('should return 403 when trying to remove the workspace owner', async () => {
    const { userId, cookieHeader } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(cookieHeader)

    const [ownerMember] = await db
      .select()
      .from(schema.workspaceMembers)
      .where(eq(schema.workspaceMembers.userId, userId))

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/workspaces/${workspaceId}/members/${ownerMember.id}`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(403)
    expect(response.json()).toMatchObject({ message: expect.any(String) })
  })

  it('should return 404 when the member does not exist', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(cookieHeader)

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/workspaces/${workspaceId}/members/non-existent-member-id`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: expect.any(String) })
  })

  it('should return 404 when the workspace does not exist', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/workspaces/non-existent-workspace-id/members/any-member-id',
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: expect.any(String) })
  })

  it('should return 401 when no access token cookie is present', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/workspaces/any-workspace-id/members/any-member-id',
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toMatchObject({ message: 'Unauthorized' })
  })
})
