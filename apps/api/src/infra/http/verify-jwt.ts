import { jwtVerify } from 'jose'
import { env } from '@/infra/env/index.ts'

export async function verifyJwt(
  token: string,
): Promise<{ userId: string } | null> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return { userId: payload.sub as string }
  } catch {
    return null
  }
}
