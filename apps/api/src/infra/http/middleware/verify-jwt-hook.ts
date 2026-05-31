import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyJwt } from '../verify-jwt.ts'

export async function verifyJwtHook(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token = request.cookies.accessToken

  if (!token) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const payload = await verifyJwt(token)

  if (!payload) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  request.userId = payload.userId
}
