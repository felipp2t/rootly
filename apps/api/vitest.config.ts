import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.e2e.spec.ts'],
    globals: true,
    tags: [
      { name: 'accept-invite', description: 'Accept workspace invite use case' },
      { name: 'assign-tag-to-folder', description: 'Assign tag to folder use case' },
      { name: 'assign-tag-to-item', description: 'Assign tag to item use case' },
      { name: 'authenticate-user', description: 'Authenticate user use case' },
      { name: 'create-folder', description: 'Create folder use case' },
      { name: 'create-item', description: 'Create item use case' },
      { name: 'create-role', description: 'Create role use case' },
      { name: 'create-tag', description: 'Create tag use case' },
      { name: 'create-workspace', description: 'Create workspace use case' },
      { name: 'decline-invite', description: 'Decline workspace invite use case' },
      { name: 'get-folders', description: 'Get folders use case' },
      { name: 'get-items', description: 'Get items use case' },
      { name: 'get-me', description: 'Get authenticated user use case' },
      { name: 'get-workspace', description: 'Get workspace use case' },
      { name: 'get-workspaces', description: 'Get workspaces use case' },
      { name: 'invite-user', description: 'Invite user to workspace use case' },
      { name: 'refresh-access-token', description: 'Refresh access token use case' },
      { name: 'register-user', description: 'Register user use case' },
    ],
  },
  plugins: [tsconfigPaths()],
})
