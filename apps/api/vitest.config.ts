import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    exclude: ['src/**/*.e2e.spec.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
    },
    tags: [
      {
        name: 'accept-invite',
        description: 'Accept workspace invite use case',
      },
      { name: 'archive-item', description: 'Archive item use case' },
      { name: 'restore-item', description: 'Restore item use case' },
      { name: 'delete-item', description: 'Delete item use case' },
      { name: 'delete-folder', description: 'Delete folder use case' },
      {
        name: 'assign-tag-to-folder',
        description: 'Assign tag to folder use case',
      },
      {
        name: 'assign-tag-to-item',
        description: 'Assign tag to item use case',
      },
      { name: 'authenticate-user', description: 'Authenticate user use case' },
      { name: 'create-folder', description: 'Create folder use case' },
      { name: 'create-item', description: 'Create item use case' },
      { name: 'create-role', description: 'Create role use case' },
      { name: 'create-tag', description: 'Create tag use case' },
      { name: 'create-workspace', description: 'Create workspace use case' },
      {
        name: 'decline-invite',
        description: 'Decline workspace invite use case',
      },
      { name: 'get-folders', description: 'Get folders use case' },
      { name: 'get-items', description: 'Get items use case' },
      { name: 'get-me', description: 'Get authenticated user use case' },
      { name: 'get-workspace', description: 'Get workspace use case' },
      { name: 'get-workspaces', description: 'Get workspaces use case' },
      { name: 'invite-user', description: 'Invite user to workspace use case' },
      {
        name: 'refresh-access-token',
        description: 'Refresh access token use case',
      },
      { name: 'register-user', description: 'Register user use case' },
      { name: 'get-roles', description: 'Get workspace roles use case' },
      { name: 'delete-role', description: 'Delete workspace role use case' },
      {
        name: 'get-role-permissions',
        description: 'Get role permissions use case',
      },
      {
        name: 'set-role-permissions',
        description: 'Set role permissions use case',
      },
      {
        name: 'get-my-workspace-permissions',
        description: 'Get my workspace permissions use case',
      },
      {
        name: 'get-workspace-members',
        description: 'Get workspace members use case',
      },
      { name: 'get-tags', description: 'Get workspace tags use case' },
      { name: 'logout', description: 'Logout use case' },
      { name: 'rename-folder', description: 'Rename folder use case' },
      { name: 'update-item', description: 'Update item use case' },
    ],
  },
  plugins: [tsconfigPaths()],
})
