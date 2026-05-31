import { createFileRoute } from '@tanstack/react-router'
import { RolesSection } from '@/components/app/settings/roles-section'

export const Route = createFileRoute(
  '/_authenticated/$workspaceId/settings/roles',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { workspaceId } = Route.useParams()
  return <RolesSection workspaceId={workspaceId} />
}
