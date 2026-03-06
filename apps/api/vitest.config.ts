import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.e2e.spec.ts'],
    globals: true,
  },
  plugins: [tsconfigPaths()],
})
