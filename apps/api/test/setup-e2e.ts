import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

let container: StartedPostgreSqlContainer

export async function setup() {
  config({ path: '.env.test' })

  container = await new PostgreSqlContainer('postgres:16-alpine').start()

  const connectionUri = container.getConnectionUri()

  // Workers herdam process.env do processo pai por serem criados após o globalSetup
  process.env.DATABASE_URL = connectionUri
  process.env.NODE_ENV = 'test'

  const pool = new Pool({ connectionString: connectionUri })
  const db = drizzle({ client: pool, casing: 'snake_case' })
  await migrate(db, { migrationsFolder: './drizzle' })
  await pool.end()
}

export async function teardown() {
  await container.stop()
}
