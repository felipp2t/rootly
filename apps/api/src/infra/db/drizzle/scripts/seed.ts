import 'dotenv/config'
import { faker } from '@faker-js/faker'
import { hash } from 'argon2'
import { nanoid } from '../helpers/nanoid.ts'
import { db } from '../index.ts'
import { schema } from '../schema/index.ts'

faker.seed(42)

type Resource = 'workspace' | 'folder' | 'item' | 'member' | 'role'
type Action = 'read' | 'create' | 'update' | 'delete' | 'invite' | 'all'
type ItemType = 'link' | 'document' | 'secret' | 'text'

const RESOURCES: Resource[] = ['workspace', 'folder', 'item', 'member', 'role']
const ITEM_TYPES: ItemType[] = ['link', 'document', 'secret', 'text']

function adminPerms(roleId: string) {
  return RESOURCES.map((resource) => ({
    id: nanoid(),
    roleId,
    resource,
    action: 'all' as Action,
  }))
}

function editorPerms(roleId: string) {
  const perms: { resource: Resource; action: Action }[] = [
    { resource: 'workspace', action: 'read' },
    { resource: 'folder', action: 'read' },
    { resource: 'folder', action: 'create' },
    { resource: 'folder', action: 'update' },
    { resource: 'item', action: 'read' },
    { resource: 'item', action: 'create' },
    { resource: 'item', action: 'update' },
    { resource: 'member', action: 'read' },
    { resource: 'role', action: 'read' },
  ]
  return perms.map((p) => ({ id: nanoid(), roleId, ...p }))
}

function viewerPerms(roleId: string) {
  return RESOURCES.map((resource) => ({
    id: nanoid(),
    roleId,
    resource,
    action: 'read' as Action,
  }))
}

function fakeItemContent(type: ItemType): string {
  switch (type) {
    case 'link':
      return faker.internet.url()
    case 'document':
      return `# ${faker.lorem.sentence()}\n\n${faker.lorem.paragraphs(2, '\n\n')}`
    case 'secret':
      return `${faker.hacker.noun().toUpperCase().replace(/\s+/g, '_')}_KEY=${faker.string.alphanumeric(32)}`
    case 'text':
      return faker.lorem.paragraph()
  }
}

const ROLE_TIERS = [
  { name: 'Admin', perms: adminPerms },
  { name: 'Editor', perms: editorPerms },
  { name: 'Viewer', perms: viewerPerms },
] as const

async function seed() {
  console.log('🌱 Seeding database...')

  // ── Cleanup (ordem inversa das FKs) ──────────────────────────────────────
  // workspace_members tem ON DELETE RESTRICT no roleId, então membros
  // precisam ser deletados antes das roles. O restante cascateia via users/workspaces.
  await db.delete(schema.items)
  await db.delete(schema.folders)
  await db.delete(schema.workspaceInvites)
  await db.delete(schema.workspaceMembers)
  await db.delete(schema.rolePermissions)
  await db.delete(schema.workspaceRoles)
  await db.delete(schema.refreshTokens)
  await db.delete(schema.workspaces)
  await db.delete(schema.users)

  console.log('  ✓ banco limpo')

  // ── Users ────────────────────────────────────────────────────────────────
  const passwordHash = await hash('password123')

  const emails = faker.helpers.uniqueArray(
    () => faker.internet.email({ provider: 'rootly.dev' }).toLowerCase(),
    30,
  )

  const users = await db
    .insert(schema.users)
    .values(
      emails.map((email) => ({
        id: nanoid(),
        name: faker.person.fullName(),
        email,
        passwordHash,
      })),
    )
    .returning()

  console.log(`  ✓ ${users.length} users`)

  // ── Workspaces ───────────────────────────────────────────────────────────
  const workspaceNames = faker.helpers.uniqueArray(
    () => faker.hacker.noun().toLowerCase().replace(/\s+/g, '-'),
    4,
  )

  const workspaces = await db
    .insert(schema.workspaces)
    .values([
      { id: nanoid(), userId: users[0].id, name: workspaceNames[0] },
      { id: nanoid(), userId: users[0].id, name: workspaceNames[1] },
      { id: nanoid(), userId: users[1].id, name: workspaceNames[2] },
      { id: nanoid(), userId: users[2].id, name: workspaceNames[3] },
    ])
    .returning()

  console.log(`  ✓ ${workspaces.length} workspaces`)

  // ── Roles + Permissions ──────────────────────────────────────────────────
  const allRoles: { id: string; workspaceId: string; name: string }[] = []

  for (const ws of workspaces) {
    const rows = await db
      .insert(schema.workspaceRoles)
      .values(
        ROLE_TIERS.map((t) => ({
          id: nanoid(),
          workspaceId: ws.id,
          name: t.name,
        })),
      )
      .returning()
    allRoles.push(...rows)
  }

  console.log(`  ✓ ${allRoles.length} roles`)

  const allPermissions = allRoles.flatMap((role) => {
    const tier = ROLE_TIERS.find((t) => t.name === role.name)!
    return tier.perms(role.id)
  })

  await db.insert(schema.rolePermissions).values(allPermissions)
  console.log(`  ✓ ${allPermissions.length} permissions`)

  // ── Members ──────────────────────────────────────────────────────────────
  const memberRows: {
    id: string
    userId: string
    workspaceId: string
    roleId: string
  }[] = []

  for (const ws of workspaces) {
    const wsRoles = allRoles.filter((r) => r.workspaceId === ws.id)
    const adminRole = wsRoles.find((r) => r.name === 'Admin')!
    const editorRole = wsRoles.find((r) => r.name === 'Editor')!
    const viewerRole = wsRoles.find((r) => r.name === 'Viewer')!

    // workspace owner → Admin
    memberRows.push({
      id: nanoid(),
      userId: ws.userId,
      workspaceId: ws.id,
      roleId: adminRole.id,
    })

    // at least 9 more users (→ 10+ members per workspace) split Editor/Viewer
    const others = faker.helpers.shuffle(
      users.filter((u) => u.id !== ws.userId),
    )
    const memberCount = faker.number.int({ min: 9, max: 14 })
    const picked = others.slice(0, memberCount)
    const editorCount = Math.ceil(picked.length / 2)
    picked.forEach((u, i) => {
      memberRows.push({
        id: nanoid(),
        userId: u.id,
        workspaceId: ws.id,
        roleId: i < editorCount ? editorRole.id : viewerRole.id,
      })
    })
  }

  await db.insert(schema.workspaceMembers).values(memberRows)
  console.log(`  ✓ ${memberRows.length} workspace members`)

  // ── Folders ──────────────────────────────────────────────────────────────
  const rootFolderRows = workspaces.flatMap((ws) => {
    const count = faker.number.int({ min: 3, max: 5 })
    const names = faker.helpers.uniqueArray(
      () =>
        faker.system.directoryPath().split('/').filter(Boolean).pop() ??
        faker.hacker.noun(),
      count,
    )
    return names.map((name) => ({
      id: nanoid(),
      workspaceId: ws.id,
      name: name.toLowerCase().replace(/\s+/g, '-'),
      parentId: null as string | null,
    }))
  })

  const rootFolders = await db
    .insert(schema.folders)
    .values(rootFolderRows)
    .returning()

  // nested subfolders inside the first root folder of each workspace
  const subFolderRows = workspaces.flatMap((ws) => {
    const first = rootFolders.find((f) => f.workspaceId === ws.id)
    if (!first) return []
    const count = faker.number.int({ min: 1, max: 2 })
    const names = faker.helpers.uniqueArray(faker.hacker.noun, count)
    return names.map((name) => ({
      id: nanoid(),
      workspaceId: ws.id,
      name: name.toLowerCase().replace(/\s+/g, '-'),
      parentId: first.id,
    }))
  })

  const subFolders = await db
    .insert(schema.folders)
    .values(subFolderRows)
    .returning()
  const folders = [...rootFolders, ...subFolders]

  console.log(`  ✓ ${folders.length} folders`)

  // ── Items ────────────────────────────────────────────────────────────────
  const itemRows = workspaces.flatMap((ws) => {
    const wsFolders = folders.filter((f) => f.workspaceId === ws.id)
    const folderOptions = [...wsFolders.map((f) => f.id), null]
    const count = faker.number.int({ min: 5, max: 8 })

    return Array.from({ length: count }, () => {
      const type = faker.helpers.arrayElement(ITEM_TYPES)
      return {
        id: nanoid(),
        workspaceId: ws.id,
        folderId: faker.helpers.arrayElement(folderOptions),
        type,
        title: faker.hacker.phrase().replace(/\b\w/g, (c) => c.toUpperCase()),
        content: fakeItemContent(type),
      }
    })
  })

  const items = await db.insert(schema.items).values(itemRows).returning()
  console.log(`  ✓ ${items.length} items`)

  console.log('\n✅ Seed complete!')
  console.log('\n📧 Login credentials (password: password123):')
  for (const u of users) {
    console.log(`   ${u.email}`)
  }

  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
