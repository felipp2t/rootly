import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../env/index.ts'
import { schema } from './schema/index.ts'

console.info(env.DATABASE_URL)

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  max: 5,
})

pool.on('connect', (client) => {
  client.query('SET timezone = "America/Sao_Paulo"')
})

export const db = drizzle({
  client: pool,
  casing: 'snake_case',
  schema,
})
