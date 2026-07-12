# Rootly

[![CI](https://github.com/felipp2t/rootly/actions/workflows/ci.yml/badge.svg)](https://github.com/felipp2t/rootly/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Rootly é uma plataforma de organização de conhecimento em equipe. Workspaces compartilhados onde
times podem criar pastas, salvar links, documentos, segredos e anotações — tudo em um só lugar,
com controle de acesso por papéis e um log de auditoria completo.

Full-stack TypeScript monorepo escrito com **Clean Architecture + DDD** no backend e
**React + TanStack** no frontend — projeto de portfólio focado em profundidade de arquitetura,
não só em CRUD.

## Funcionalidades

- **Workspaces** — espaços de trabalho colaborativos, multi-tenant, com convites e roles
- **RBAC granular** — roles customizáveis por workspace, permissões por recurso/ação (`read`,
  `create`, `update`, `delete`, `invite`, `all`)
- **Pastas e itens** — organize conteúdo em hierarquias de pastas; tipos de item: link, documento,
  segredo e texto
- **Upload de arquivos** — itens do tipo documento podem ser enviados como arquivo, armazenados em
  object storage (MinIO/S3)
- **Log de atividades** — auditoria completa de quem fez o quê e quando, cobrindo pastas, itens,
  membros, workspaces e roles
- **Notificações em tempo real** — via WebSocket
- **Autenticação** — registro, login e sessões seguras via JWT (cookies HTTP-only) + Argon2
- **Documentação de API interativa** — Swagger UI gerado a partir dos schemas Zod das rotas

## Apps

| App | Descrição | README |
|-----|-----------|--------|
| `apps/api` | API REST (Fastify + Drizzle + PostgreSQL) | [apps/api/README.md](apps/api/README.md) |
| `apps/web` | Interface web (React + Vite + TanStack) | [apps/web/README.md](apps/web/README.md) |

## Qualidade

- **625 testes automatizados** (529 unitários com repositórios em memória + 96 e2e contra um
  Postgres real via Testcontainers), 97%+ de cobertura de statements na API
- **CI** rodando lint, typecheck, build e a suíte completa de testes a cada push/PR
- Domínio isolado de infraestrutura (Clean Architecture): entidades e casos de uso não conhecem
  Fastify, Drizzle ou HTTP

## Início rápido

```bash
# instalar dependências
pnpm install

# subir Postgres + MinIO (ver apps/api/README.md para detalhes de configuração)
cd apps/api && cp .env.example .env && docker compose up -d && pnpm db:migrate
cd ../..

# rodar API + Web simultaneamente
pnpm dev

# ou separadamente
pnpm dev:api
pnpm dev:web
```

API em `http://localhost:3333` (docs em `/docs`), web em `http://localhost:5173`.

Para popular o banco com dados de demonstração (usuários, workspaces, roles, pastas e itens
fake): `pnpm --filter api db:seed`.

Para detalhes de configuração, arquitetura e comandos de cada app, consulte o `README.md` dentro
de cada pasta em `apps/`.

## Licença

[MIT](LICENSE)
