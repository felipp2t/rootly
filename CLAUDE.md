# Rootly

TypeScript monorepo (pnpm workspaces). Project-specific conventions, stack details, and
architecture patterns live in `.claude/skills/` (and `apps/api/.claude/skills/` for
API-layer conventions) — invoke the relevant skill instead of duplicating that knowledge here.

## Rules

- Use TypeScript everywhere, with strict typing. Never use `any`.
- Never use `npm` or `yarn` — this is a pnpm workspace.
- Run lint and the relevant test suite before considering a change complete.
- Prefer editing existing files over creating new ones; avoid unnecessary abstraction.

## MCP

- ALWAYS use Serena MCP (when available) for semantic code retrieval and editing tools.
- ALWAYS use Context7 MCP (when available) for up to date documentation on third-party code.
