# Rootly

Rootly é uma plataforma de organização de conhecimento em equipe. Workspaces compartilhados onde times podem criar pastas, salvar links, documentos, segredos e anotações — tudo em um só lugar, com controle de acesso por papéis.

## Funcionalidades

- **Workspaces** — espaços de trabalho colaborativos com convites e roles
- **Pastas e itens** — organize conteúdo em hierarquias de pastas
- **Tipos de item** — links, documentos, segredos e textos
- **Tags** — categorize e filtre itens com tags
- **Notificações** — eventos em tempo real dentro do workspace
- **Autenticação** — registro, login e sessões seguras via JWT

## Apps

| App | Descrição |
|-----|-----------|
| `apps/api` | API REST (Fastify + PostgreSQL) |
| `apps/web` | Interface web (React + Vite) |

## Início rápido

```bash
# Instalar dependências
pnpm install

# Rodar API e Web simultaneamente
pnpm dev

# Ou separadamente
pnpm dev:api
pnpm dev:web
```

Para detalhes de configuração de cada app, consulte o `README.md` dentro de cada pasta em `apps/`.
