import { INVITE_EXPIRATION_MS } from '@/domain/root/enterprise/entities/workspace-invite.ts'

export function defaultExpiresAt(): Date {
  return new Date(Date.now() + INVITE_EXPIRATION_MS)
}
