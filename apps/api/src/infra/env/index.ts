import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string('DATABASE_URL is required'),
  JWT_SECRET: z.string('JWT_SECRET is required'),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z
    .union([z.literal(false), z.literal('false')])
    .transform(() => false as const)
    .default(false),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_BUCKET: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  for (const issue of _env.error.issues) {
    console.error(`- ${issue.path.join('.')} (${issue.code}): ${issue.message}`)
  }
  process.exit(1)
}

export const env = _env.data
