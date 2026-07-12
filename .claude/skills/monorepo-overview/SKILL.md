---
name: monorepo-overview
description: Rootly monorepo structure, tech stack overview for apps/api and apps/web, and the pnpm commands for running dev servers, building, linting, testing, database migrations, and OpenAPI client generation. Use when running any project command, navigating the monorepo, or needing a refresher on which technology is used where.
---

# Monorepo Overview

## Structure

Managed with **pnpm workspaces** (v10+). Always use `pnpm`, never `npm` or `yarn`.

```
rootly/
├── apps/api/   # Backend
└── apps/web/   # Frontend
```

## Stack — API (`apps/api`)

| Responsibility | Technology |
|------------------|------------|
| HTTP framework | Fastify 5 |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Validation | Zod 4 |
| Authentication | JWT (jose) + Argon2 |
| Testing | Vitest |
| Linting/Format | Biome |

Architecture: **Clean Architecture + DDD** with `core → domain → infra` layers. See the
`domain-entities`, `use-cases`, `http-layer`, `database-layer` and `test-conventions` skills
under `apps/api/.claude/skills/` for the conventions of each layer.

## Stack — Web (`apps/web`)

| Responsibility | Technology |
|-----------------|------------|
| Framework | React 18 + Vite |
| Routing | TanStack Router |
| Data fetching | TanStack Query + Fetch |
| Forms | TanStack Form |
| UI | shadcn/ui + Tailwind CSS 4 |
| Validation | Zod |
| HTTP clients | Generated via orval (OpenAPI) |

## Main commands

```bash
pnpm install          # install dependencies
pnpm dev              # run API + Web
pnpm dev:api          # API only
pnpm dev:web          # Web only
pnpm build            # build all apps
pnpm lint             # lint all apps
pnpm format           # format all apps
```

## Database

```bash
pnpm --filter api db:generate   # generate a migration after changing a schema
pnpm --filter api db:migrate    # apply migrations
pnpm --filter api db:studio     # open Drizzle Studio
pnpm --filter api db:seed       # reset and repopulate with demo data
```

> **Never manually edit** the files inside `apps/api/drizzle/` — they are auto-generated.

## Tests

```bash
pnpm --filter api test        # unit tests
pnpm --filter api test:e2e    # end-to-end
pnpm --filter api test:cov    # with coverage
```

## OpenAPI

```bash
pnpm --filter api openapi     # generate openapi.json
pnpm --filter web generate    # generate HTTP clients from openapi.json
```
