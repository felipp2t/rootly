# Handoff

## 🧠 Contexto da Conversa

O backend e o frontend de **atribuir/alterar a role de um membro** já foram concluídos e commitados. A próxima tarefa é **refatorar a página de Settings**: hoje General/Members/Roles são alternados por `useState` dentro de um único arquivo; o objetivo é transformá-los em **rotas separadas** (file-based routing do TanStack Router), cada uma com **seu próprio skeleton de página**.

## ✅ O que foi feito (tarefas anteriores — já commitado)

- **Feature "assign role to member" — API + Web — completa e commitada.** 4 commits em `main` (ainda não pushados; branch 8+4 commits à frente de origin):
  - `99e90f2` feat(api): add assign role to member endpoint
  - `93537a3` chore: regenerate openapi spec and web http clients
  - `b0885ff` feat(web): allow changing a member's role from settings
  - `3efd6fc` docs: add session handoff notes for role assignment
- API: rota `PATCH /workspaces/:workspaceId/members/:memberId/role`, use case `assign-role-to-member.ts` (+spec, 7 testes passando), controller, factory, e2e, método `save` no `WorkspaceMemberRepository` (interface + Drizzle + in-memory). 400 testes unitários passando.
- Web: hook orval `useAssignRoleToMember` gerado; criado `apps/web/src/components/ui/dropdown-menu.tsx` (wrapper radix estilizado no padrão brutalista); `members-section.tsx` agora transforma o badge de role num dropdown picker, gated por `can('member','update')`, com spinner por linha e invalidação da query de members.

## 🔄 Estado atual

Working tree limpo, tudo commitado. **A nova tarefa ainda não foi iniciada.** A página de settings está em `apps/web/src/pages/_authenticated/$workspaceId/settings.tsx` e usa estado local:

- `const [activeSection, setActiveSection] = useState<SettingsSection>('roles')` (default `'roles'`).
- `NAV_ITEMS` = `general` (SettingsIcon), `members` (UsersIcon), `roles` "Roles & Permissions" (ShieldIcon).
- Nav são `<button>` que chamam `setActiveSection`; conteúdo renderizado condicionalmente: `<GeneralSection/>`, `<MembersSection workspaceId/>`, `<RolesSection workspaceId/>`.
- Layout: breadcrumb (InlineCode*), título "SETTINGS", `<nav>` de 52 (w-52) + `<Separator orientation='vertical'/>` + `<div className='flex-1 min-w-0'>` com o conteúdo.

## ⏭️ Próximos passos

1. **Transformar `settings.tsx` em rota de layout.** Manter breadcrumb + título + `<nav>` lateral + separator, e trocar a `div` de conteúdo por `<Outlet/>`. O componente da rota passa a só renderizar o shell + Outlet. (TanStack file-based: um arquivo `settings.tsx` que renderiza `<Outlet/>` vira layout das rotas filhas `settings.*`.)
2. **Criar as rotas filhas** (flat routing, seguindo o padrão do projeto em `src/pages`):
   - `settings.index.tsx` → redirect para a aba default (ex.: `general` ou `roles`) via `beforeLoad`/`redirect`, OU renderizar General direto.
   - `settings.general.tsx` → `createFileRoute('/_authenticated/$workspaceId/settings/general')`, renderiza `<GeneralSection/>`.
   - `settings.members.tsx` → renderiza `<MembersSection workspaceId/>`.
   - `settings.roles.tsx` → renderiza `<RolesSection workspaceId/>`.
   - Pegar `workspaceId` via `Route.useParams()` em cada rota.
3. **Converter os itens de `<nav>` de `<button>` para `<Link>`** (TanStack `Link to='/$workspaceId/settings/members' params={{workspaceId}}`). Estado ativo via `activeProps`/`activeOptions` do `Link` (substituir a lógica `isActive` baseada em `activeSection`). Manter classes: ativo = `bg-primary/10 text-primary border-l-2 border-primary`; inativo = `text-muted-foreground hover:text-foreground hover:bg-muted/30 border-l-2 border-transparent`.
4. **Skeleton por página.** Cada rota deve exibir um skeleton enquanto carrega. Usar `pendingComponent` na rota OU `<Suspense fallback={<...Skeleton/>}>` na página. Reaproveitar/expor os skeletons já existentes: `MembersSectionSkeleton` (interno em `members-section.tsx`) e `RolesSectionSkeleton` (interno em `roles-section.tsx`) — exportá-los, ou criar skeletons de página dedicados. General provavelmente não tem skeleton (verificar `general-section.tsx`); criar um se necessário.
5. **Remover** o `useState`/`SettingsSection`/`activeSection` e a renderização condicional do `settings.tsx`.
6. **Regenerar a route tree** se o projeto usar geração manual (normalmente o plugin Vite do TanStack Router regenera `routeTree.gen.ts` automaticamente no dev/build — confirmar). Rodar `pnpm dev:web` ou `pnpm --filter web build` para validar.
7. Atualizar quaisquer `<Link to='/$workspaceId/settings'>` existentes para apontar à nova sub-rota default (buscar referências).

## 📎 Informações importantes para lembrar

- **Roteamento:** TanStack Router **file-based**, diretório de rotas = `apps/web/src/pages` (não `routes`). `routeTree.gen.ts` é gerado pelo plugin Vite (`apps/web/vite.config.ts`) — **não editar manualmente**. Layout pai usa `<Outlet/>` (ver `_authenticated/layout.tsx`).
- **Padrão de rota:** `export const Route = createFileRoute('<path>')({ component, beforeLoad?, pendingComponent? })`; params via `Route.useParams()`.
- **Padrão de página com dados:** componentes usam hooks `useXSuspense` (orval) + `Suspense` com fallback skeleton (ver `$workspaceId/index.tsx` — `RouteComponent` envolve `RoutePage` em `<Suspense fallback={<RouteSuspense/>}>`).
- **Componentes de seção já existem** em `apps/web/src/components/app/settings/`: `general-section.tsx`, `members-section.tsx`, `roles-section.tsx`. `MembersSection`/`RolesSection` recebem `workspaceId`; `GeneralSection` não recebe props. Members e Roles já têm `Suspense` interno + skeletons internos (`MembersSectionSkeleton`, `RolesSectionSkeleton`) — atualmente NÃO exportados.
- **Aesthetic (manter):** brutalista/industrial — `font-mono`, UPPERCASE, `tracking-wide`, bordas sharp (sem rounded), `bg-card`/`bg-muted/10`, accent `primary`, ícones lucide. Não introduzir aesthetic nova.
- **Stack web:** React 18 + Vite, TanStack Router/Query/Form, shadcn/ui + Tailwind CSS 4, clientes HTTP via orval (não editar `src/api/**`, são gerados). `radix-ui` (pacote unificado) disponível para primitivos.
- **Permissões:** hook `useWorkspacePermissions(workspaceId)` → `can(resource, action)`. Roles section usa `can('role','create'|'delete')`; members usa `can('member','update')`.
- **Comandos:** `pnpm dev:web`; lint `npx biome check --write <files>` em `apps/web`; typecheck `npx tsc --noEmit` em `apps/web`. Sempre `pnpm`.
