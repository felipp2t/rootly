# Rootly

[![CI](https://github.com/felipp2t/rootly/actions/workflows/ci.yml/badge.svg)](https://github.com/felipp2t/rootly/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Rootly is a team knowledge organization platform. Shared workspaces where teams can create
folders, save links, documents, secrets and notes — all in one place, with role-based access
control and a full audit log.

Full-stack TypeScript monorepo built with **Clean Architecture + DDD** on the backend and
**React + TanStack** on the frontend — a portfolio project focused on architectural depth, not
just CRUD.

## Features

- **Workspaces** — collaborative, multi-tenant workspaces with invites and roles
- **Granular RBAC** — custom roles per workspace, permissions per resource/action (`read`,
  `create`, `update`, `delete`, `invite`, `all`)
- **Folders & items** — organize content in folder hierarchies; item types: link, document,
  secret and text
- **File upload** — document items can be uploaded as files, stored in object storage
  (MinIO/S3)
- **Activity log** — full audit trail of who did what and when, covering folders, items,
  members, workspaces and roles
- **Real-time notifications** — pushed over WebSocket
- **Authentication** — registration, login and secure sessions via JWT (HTTP-only cookies) +
  Argon2
- **Interactive API docs** — Swagger UI generated from the routes' Zod schemas

## Apps

| App | Description | README |
|-----|-----------|--------|
| `apps/api` | REST API (Fastify + Drizzle + PostgreSQL) | [apps/api/README.md](apps/api/README.md) |
| `apps/web` | Web interface (React + Vite + TanStack) | [apps/web/README.md](apps/web/README.md) |

## Quality

- **625 automated tests** (529 unit tests with in-memory repositories + 96 e2e tests against a
  real Postgres via Testcontainers), 97%+ statement coverage on the API
- **CI** running lint, typecheck, build and the full test suite on every push/PR
- Domain isolated from infrastructure (Clean Architecture): entities and use cases know nothing
  about Fastify, Drizzle or HTTP

## Quick start

```bash
# install dependencies
pnpm install

# start Postgres + MinIO (see apps/api/README.md for configuration details)
cd apps/api && cp .env.example .env && docker compose up -d && pnpm db:migrate
cd ../..

# run API + Web together
pnpm dev

# or separately
pnpm dev:api
pnpm dev:web
```

API at `http://localhost:3333` (docs at `/docs`), web at `http://localhost:5173`.

To seed the database with demo data (users, workspaces, roles, folders and fake items):
`pnpm --filter api db:seed`.

For configuration, architecture and command details for each app, see the `README.md` inside
each folder under `apps/`.

## License

[MIT](LICENSE)
