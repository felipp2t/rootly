import { makeWorkspaceInvite } from '@test/factories/make-workspace-invite.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { workspaceInviteStatus } from '@/domain/root/enterprise/entities/workspace-invite.ts'
import { InMemoryWorkspaceInviteRepository } from './in-memory-workspace-invite-repository.ts'

describe('InMemoryWorkspaceInviteRepository', () => {
  let repo: InMemoryWorkspaceInviteRepository

  beforeEach(() => {
    repo = new InMemoryWorkspaceInviteRepository()
  })

  describe('create', () => {
    it('should add an invite to items', async () => {
      const invite = makeWorkspaceInvite({
        workspaceId: 'ws-1',
        invitedUserId: 'u-1',
        invitedByUserId: 'u-2',
        roleId: 'r-1',
      })
      await repo.create(invite)
      expect(repo.items).toHaveLength(1)
      expect(repo.items[0]).toBe(invite)
    })
  })

  describe('findById', () => {
    it('should return the invite when found', async () => {
      const id = new UniqueEntityID('inv-1')
      const invite = makeWorkspaceInvite(
        {
          workspaceId: 'ws-1',
          invitedUserId: 'u-1',
          invitedByUserId: 'u-2',
          roleId: 'r-1',
        },
        id,
      )
      await repo.create(invite)

      const result = await repo.findById('inv-1')

      expect(result).toBe(invite)
    })

    it('should return null when not found', async () => {
      const result = await repo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    it('should return all invites when called without status filter', async () => {
      const i1 = makeWorkspaceInvite({
        workspaceId: 'ws-1',
        invitedUserId: 'u-1',
        invitedByUserId: 'u-2',
        roleId: 'r-1',
        status: workspaceInviteStatus.PENDING,
      })
      const i2 = makeWorkspaceInvite({
        workspaceId: 'ws-1',
        invitedUserId: 'u-3',
        invitedByUserId: 'u-2',
        roleId: 'r-1',
        status: workspaceInviteStatus.ACCEPTED,
      })
      await repo.create(i1)
      await repo.create(i2)

      const result = await repo.findMany()

      expect(result).toHaveLength(2)
    })

    it('should filter by status when provided', async () => {
      const pending = makeWorkspaceInvite({
        workspaceId: 'ws-1',
        invitedUserId: 'u-1',
        invitedByUserId: 'u-2',
        roleId: 'r-1',
        status: workspaceInviteStatus.PENDING,
      })
      const accepted = makeWorkspaceInvite({
        workspaceId: 'ws-1',
        invitedUserId: 'u-3',
        invitedByUserId: 'u-2',
        roleId: 'r-1',
        status: workspaceInviteStatus.ACCEPTED,
      })
      await repo.create(pending)
      await repo.create(accepted)

      const result = await repo.findMany([workspaceInviteStatus.PENDING])

      expect(result).toHaveLength(1)
      expect(result[0]).toBe(pending)
    })

    it('should return empty array when no invites match the status filter', async () => {
      const invite = makeWorkspaceInvite({
        workspaceId: 'ws-1',
        invitedUserId: 'u-1',
        invitedByUserId: 'u-2',
        roleId: 'r-1',
        status: workspaceInviteStatus.PENDING,
      })
      await repo.create(invite)

      const result = await repo.findMany([workspaceInviteStatus.DECLINED])

      expect(result).toHaveLength(0)
    })
  })

  describe('save', () => {
    it('should update an existing invite', async () => {
      const id = new UniqueEntityID('inv-save')
      const invite = makeWorkspaceInvite(
        {
          workspaceId: 'ws-1',
          invitedUserId: 'u-1',
          invitedByUserId: 'u-2',
          roleId: 'r-1',
        },
        id,
      )
      await repo.create(invite)

      invite.accept()
      await repo.save(invite)

      expect(repo.items[0].status).toBe(workspaceInviteStatus.ACCEPTED)
    })

    it('should do nothing when invite does not exist', async () => {
      const invite = makeWorkspaceInvite({
        workspaceId: 'ws-1',
        invitedUserId: 'u-1',
        invitedByUserId: 'u-2',
        roleId: 'r-1',
      })

      await repo.save(invite)

      expect(repo.items).toHaveLength(0)
    })
  })

  describe('revoke', () => {
    it('should set status to revoked', async () => {
      const id = new UniqueEntityID('inv-rev')
      const invite = makeWorkspaceInvite(
        {
          workspaceId: 'ws-1',
          invitedUserId: 'u-1',
          invitedByUserId: 'u-2',
          roleId: 'r-1',
        },
        id,
      )
      await repo.create(invite)

      await repo.revoke('inv-rev')

      expect(repo.items[0].status).toBe(workspaceInviteStatus.REVOKED)
    })

    it('should do nothing when invite does not exist', async () => {
      const invite = makeWorkspaceInvite({
        workspaceId: 'ws-1',
        invitedUserId: 'u-1',
        invitedByUserId: 'u-2',
        roleId: 'r-1',
      })
      await repo.create(invite)

      await repo.revoke('nonexistent')

      expect(repo.items[0].status).toBe(workspaceInviteStatus.PENDING)
    })
  })
})
