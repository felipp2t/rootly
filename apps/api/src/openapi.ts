import { writeFileSync } from 'node:fs'

process.env.DATABASE_URL ??= 'postgresql://placeholder:placeholder@localhost/placeholder'
process.env.JWT_SECRET ??= 'placeholder-secret'

const { app } = await import('./app.ts')

await app.ready()

const spec = app.swagger()
writeFileSync('./openapi.json', JSON.stringify(spec, null, 2))

await app.close()

console.log('✓ openapi.json exported')
