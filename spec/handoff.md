# Handoff

## 🧠 Contexto da Conversa

O objetivo é implementar, na API (`apps/api`), a funcionalidade de **atribuir/alterar a role de um membro de um workspace**. A conversa começou com a verificação de que **não existe nenhuma rota nem use case para isso** hoje — apenas CRUD de roles e leitura de membros. Esta sessão foi de investigação/levantamento; nada foi implementado ainda.

## ✅ O que foi feito

- Mapeados todos os controllers existentes em `apps/api/src/infra/http/controllers`. **Não há** `assign-role`, `update-member-role` ou equivalente. Relacionados a role/member que existem: `create-role`, `delete-role`, `get-roles`, `get-role-permissions`, `set-role-permissions`, `get-workspace-members`.
- Mapeados os use cases em `apps/api/src/domain/root/application/use-cases`. **Não há** use case de atribuição/alteração de role a membro.
- Confirmado que a entidade `WorkspaceMember` (`apps/api/src/domain/root/enterprise/entities/workspace-member.ts`) **já suporta a alteração**: possui `get roleId()` e um **setter `set roleId(value: string)` que chama `touch()`** (atualiza `updatedAt`).
- Confirmado que o **`WorkspaceMemberRepository`** (interface em `apps/api/src/domain/root/application/repositories/workspace-member-repository.ts`) **NÃO tem método `save`/`update`** — só `findById`, `findByUserId`, `findByUserIdAndWorkspaceId`, `findByRoleId`, `findManyByWorkspaceId`, `create`, `delete`.
- Confirmado que a impl Drizzle (`apps/api/src/infra/db/drizzle/repositories/workspace-member-repository.ts`) também **não tem `save`/`update`**.
- Lido o template de controller `set-role-permissions.controller.ts` (rota `PUT /workspaces/:workspaceId/roles/:roleId/permissions`) — bom modelo para a nova rota (verifyJwt, params, switch de erros).
- Lido `routes.ts` — registro central dos controllers; a nova rota precisa ser registrada aqui.
- Lido `get-workspace-members.ts` use case — mostra o padrão de validar workspace via `workspaceRepository.findById(userId, workspaceId)` e resolver role via `workspaceRoleRepository.findById(roleId)`.

## 🔄 Estado atual

Somente investigação concluída. **Nenhum código novo escrito.** A conclusão é: a feature precisa ser construída do zero (use case + método de repositório + controller + rota + factory + testes), aproveitando o setter `roleId` já existente na entidade.

## ⏭️ Próximos passos

1. **Adicionar método de persistência ao repositório.** Incluir `abstract save(member: WorkspaceMember): Promise<void>` (ou `update`) na interface `WorkspaceMemberRepository` e implementar no `DrizzleWorkspaceMemberRepository` com `db.update(schema.workspaceMembers).set(...).where(eq(id, ...))` via o mapper `DrizzleWorkspaceMemberMapper.toDrizzle`. Atualizar também o in-memory repo em `apps/api/test/repositories/`.
2. **Criar o use case** `assign-role-to-member.ts` (ou `update-member-role.ts`) em `apps/api/src/domain/root/application/use-cases`. Request sugerido: `{ userId, workspaceId, memberId (ou targetUserId), roleId }`. Validar: workspace existe (via `workspaceRepository.findById(userId, workspaceId)`), member existe e pertence ao workspace, role existe e pertence ao workspace (`workspaceRoleRepository.findById`). Setar `member.roleId = roleId` e chamar `repository.save(member)`. Retornar `Either<BaseError, {}>`. Considerar permissão `member:update`.
3. **Criar o `.spec.ts`** do use case (in-memory repos + factories de `test/`), cobrindo happy path + cada erro (workspace/member/role não encontrados).
4. **Criar o controller** `assign-role-to-member.controller.ts` seguindo o padrão de `set-role-permissions.controller.ts`. Rota sugerida: `PATCH /workspaces/:workspaceId/members/:memberId/role` com body `{ roleId }`, protegida por `verifyJwt`, resposta `204`. Mapear `ResourceNotFoundError → 404` no switch.
5. **Criar a factory** `make-assign-role-to-member-use-case.ts` em `apps/api/src/infra/http/factories/` (wire dos repos Drizzle + `db`).
6. **Registrar o controller** em `apps/api/src/infra/http/routes.ts`.
7. **Criar o teste e2e** `assign-role-to-member.e2e.spec.ts` seguindo os e2e existentes.
8. **Regenerar OpenAPI + cliente web:** `pnpm --filter api openapi` e depois `pnpm --filter web generate`.
9. Rodar `pnpm --filter api test` e `pnpm --filter api test:e2e`.

## 📎 Informações importantes para lembrar

- **Monorepo pnpm.** Sempre `pnpm`, nunca npm/yarn. API em `apps/api`. Plataforma Windows/PowerShell.
- **Arquitetura:** Clean Architecture + DDD, camadas `core → domain → infra`. Use cases dependem de **abstrações** (classes abstratas), nunca de impls concretas; o wiring fica nas factories.
- **Use cases retornam `Either<L, R>`** (`left`/`right`), nunca lançam. Erros em `use-cases/errors/`, estendem `Error` e implementam `BaseError`. Reutilizar `ResourceNotFoundError` de `@/core/errors/errors/resource-not-found-error.ts`.
- **Entidades:** props via getters; campos mutáveis têm setter + `touch()`. `WorkspaceMember.roleId` já tem setter pronto. `WorkspaceMember` é `AggregateRoot` e dispara `MemberJoinedEvent` na criação (apenas quando `id` ausente).
- **`WorkspaceMemberProps`:** `{ userId, workspaceId, roleId, createdAt, updatedAt }`.
- **Controllers:** Fastify plugin `FastifyPluginCallbackZod`, um arquivo por rota, nome `<action>-<resource>.controller.ts`, export com mesmo nome. Instanciar use case **dentro do handler** via factory. Mapear erros com `switch (error.constructor.name)`, sempre com `default → 500`. Declarar `operationId` (camelCase), `tags`, e schemas de `response`.
- **Auth:** rotas protegidas leem cookie `accessToken` e chamam `verifyJwt` (retorna `{ userId } | null`) no topo do handler — não há hook global. Incluir `401` no response schema.
- **Status mapping:** já existe → 409; regra/input inválido → 400; credenciais → 401; não encontrado → 404; desconhecido → 500.
- **DB:** Drizzle, colunas snake_case / TS camelCase. **NUNCA editar `apps/api/drizzle/`** (gerado). Esta feature **não exige migration** (só usa update de coluna existente `role_id`). Tabela: `schema.workspaceMembers`.
- **OpenAPI:** após nova rota, rodar `pnpm --filter api openapi` e `pnpm --filter web generate` (orval) para atualizar o cliente do front.
- **Testes:** variável do alvo sempre `sut`. In-memory repos em `test/repositories/`, factories em `test/factories/`. e2e em `*.e2e.spec.ts` ao lado do controller.
- **MCP:** preferir Serena (retrieval/edição semântica) e Context7 (docs de libs) quando disponíveis.
- **Decisão em aberto:** identificar o membro por `memberId` (id da tabela workspace_members) vs `targetUserId` na rota — checar como o front consome `get-workspace-members` (retorna ambos `id` e `userId`). A rota sugerida usa `memberId`.
