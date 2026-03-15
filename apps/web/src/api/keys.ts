import type { GetFoldersParams, GetItemsParams } from './model'

export const QUERY_KEYS = {
  health: () => ['health'],
  workspaces: () => ['workspaces'],
  folders: (params?: GetFoldersParams) => [
    'folders',
    ...(params ? [params] : []),
  ],
  items: (params?: GetItemsParams) => ['items', ...(params ? [params] : [])],
  me: () => ['me'],
} as const
