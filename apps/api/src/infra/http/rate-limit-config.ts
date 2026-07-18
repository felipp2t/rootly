import { env } from '@/infra/env/index.ts'

const isTest = env.NODE_ENV === 'test'

export const globalRateLimit = {
  max: isTest ? 100_000 : 100,
  timeWindow: '1 minute',
}

export const authRateLimit = {
  max: isTest ? 100_000 : 5,
  timeWindow: '1 minute',
}
