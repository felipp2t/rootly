import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$workspaceId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { workspaceId } = Route.useParams()

  return <div>Hello "/{workspaceId}/"!</div>
}
