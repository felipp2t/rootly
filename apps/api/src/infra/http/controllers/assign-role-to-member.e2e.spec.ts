import { eq } from 'drizzle-orm'
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('PATCH /workspaces/:workspaceId/members/:memberId/role', () => {
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

  it('should assign a new role to a member and return 204', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(cookieHeader)

    const [oldRole] = await db
      .insert(schema.workspaceRoles)
      .values({ workspaceId, name: 'Viewer' })
      .returning()

    const [newRole] = await db
      .insert(schema.workspaceRoles)
      .values({ workspaceId, name: 'Developer' })
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
      .values({ userId: user.id, workspaceId, roleId: oldRole.id })
      .returning()

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/workspaces/${workspaceId}/members/${member.id}/role`,
      headers: { cookie: cookieHeader },
      payload: { roleId: newRole.id },
    })

    expect(response.statusCode).toBe(204)

    const [updated] = await db
      .select()
      .from(schema.workspaceMembers)
      .where(eq(schema.workspaceMembers.id, member.id))

    expect(updated.roleId).toBe(newRole.id)
  })
})
