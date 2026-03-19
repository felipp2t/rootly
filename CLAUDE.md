# Rootly — Guia de Desenvolvimento

## Monorepo

Gerenciado com **pnpm workspaces** (v10+). Sempre use `pnpm`, nunca `npm` ou `yarn`.

```
rootly/
├── apps/api/   # Backend
└── apps/web/   # Frontend
```

## Stack — API (`apps/api`)

| Responsabilidade | Tecnologia |
|------------------|------------|
| Framework HTTP | Fastify 5 |
| ORM | Drizzle ORM |
| Banco de dados | PostgreSQL |
| Validação | Zod 4 |
| Autenticação | JWT (jose) + Argon2 |
| Testes | Vitest |
| Linting/Format | Biome |

Arquitetura: **Clean Architecture + DDD** com camadas `core → domain → infra`.

## Stack — Web (`apps/web`)

| Responsabilidade | Tecnologia |
|-----------------|------------|
| Framework | React 18 + Vite |
| Roteamento | TanStack Router |
| Data fetching | TanStack Query + Fetch |
| Formulários | TanStack Form |
| UI | shadcn/ui + Tailwind CSS 4 |
| Validação | Zod |
| Clientes HTTP | Gerados via orval (OpenAPI) |

## Comandos principais

```bash
pnpm install          # instalar dependências
pnpm dev              # rodar API + Web
pnpm dev:api          # apenas API
pnpm dev:web          # apenas Web
pnpm build            # build de todos os apps
pnpm lint             # lint em todos os apps
pnpm format           # format em todos os apps
```

## Banco de dados

```bash
pnpm --filter api db:generate   # gerar migration após alterar schema
pnpm --filter api db:migrate    # aplicar migrations
pnpm --filter api db:studio     # abrir Drizzle Studio
```

> **Nunca edite manualmente** os arquivos dentro de `apps/api/drizzle/` — são gerados automaticamente.

## Testes

```bash
pnpm --filter api test        # unitários
pnpm --filter api test:e2e    # end-to-end
pnpm --filter api test:cov    # com cobertura
```

## OpenAPI

```bash
pnpm --filter api openapi     # gera openapi.json
pnpm --filter web generate    # gera clientes HTTP a partir do openapi.json
```
