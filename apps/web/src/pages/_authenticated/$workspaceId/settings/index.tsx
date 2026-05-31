import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/$workspaceId/settings/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/$workspaceId/settings/general',
      params: { workspaceId: params.workspaceId },
    })
  },
})
