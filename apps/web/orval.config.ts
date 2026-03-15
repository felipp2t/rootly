import { defineConfig } from 'orval'

export default defineConfig({
  rootly: {
    input: {
      target: '../api/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/api/index.ts',
      schemas: './src/api/model',
      client: 'react-query',
      baseUrl: 'http://localhost:3333',
      override: {
        mutator: {
          path: './src/shared/lib/fetch.ts',
          name: 'fetchWithAuth',
        },
        query: {
          useSuspenseQuery: true,
          shouldSplitQueryKey: true,
        },
      },
    },
  },
})
