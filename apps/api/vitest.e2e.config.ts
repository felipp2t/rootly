import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.e2e.spec.ts'],
    globals: true,
    globalSetup: ['./test/setup-e2e.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
  plugins: [tsconfigPaths()],
})
