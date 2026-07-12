---
name: ui-components
description: UI component conventions for the Rootly web app (apps/web/src/components). Covers the components/ui vs components/app split, shadcn/ui + Tailwind CSS 4, the cn() className utility, lucide-react icons, and dark mode via next-themes. Use when creating or modifying a component, or styling UI.
---

# UI Components

## Component organization

```
components/
├── ui/     # shadcn/ui primitives (Button, Field, ScrollArea, Badge, ...) — generic, no business logic
└── app/    # feature components (settings sections, activity feed, item cards, ...)
```

- `components/ui/` primitives are added/managed via the shadcn CLI (`components.json` config:
  style `radix-mira`, base color `neutral`, no Tailwind config file — CSS-first `@theme` in
  `src/globals.css`, Tailwind v4). Treat them as a library — extend via `className`/`variant`
  props rather than editing the primitive's internals unless fixing a real bug in it.
- `components/app/` components compose primitives + data fetching into actual product features.
  See the `data-fetching` skill for the Suspense/Loader/Skeleton pattern they typically follow.

## Styling

- Use the `cn()` helper from `@/lib/utils` (clsx + tailwind-merge) to combine conditional classes
  — never string-concatenate `className`.

```typescript
import { cn } from '@/lib/utils'

className={cn(
  'flex items-start gap-3 px-4 py-3',
  striped ? 'bg-card' : 'bg-muted/10',
)}
```

- Variants on primitives use `class-variance-authority` (`cva`) — see `components/ui/badge.tsx`
  for the pattern (a `cva(base, { variants: { variant: {...} } })` plus a typed component wrapper).
- The product's visual language leans on a **monospace, terminal-like aesthetic** for metadata/
  labels: `font-mono text-xs uppercase tracking-wide text-muted-foreground` shows up throughout
  (activity feed rows, section labels, badges). Match this for new metadata/label text rather
  than defaulting to the base sans font.
- Tailwind CSS v4 — configuration lives in `@theme` blocks in `src/globals.css`, not a
  `tailwind.config.ts` file.

## Icons

Despite `components.json` configuring `hugeicons` as the shadcn icon library, **`lucide-react` is
the icon set actually used** throughout the app (roughly 6x more usage) — prefer it for new
components unless a specific icon is only available in `@hugeicons/react`.

## Dark mode

`next-themes`' `ThemeProvider` wraps the app in `main.tsx`. Components should use Tailwind's dark
variant / CSS custom properties (already wired through shadcn's theme tokens) rather than
branching on a theme value in JS — see `components/app/settings/theme-preference-section.tsx`
for the one place that actually needs to read/set the theme explicitly.

## Feedback

User-facing success/error feedback uses `sonner`'s `toast()` (see the `data-fetching` skill's
mutation pattern) — not inline banners or `alert()`.
