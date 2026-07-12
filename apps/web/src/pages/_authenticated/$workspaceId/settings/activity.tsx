import { createFileRoute } from '@tanstack/react-router'
import { ActivitySection } from '@/components/app/settings/activity-section'

export const Route = createFileRoute(
  '/_authenticated/$workspaceId/settings/activity',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { workspaceId } = Route.useParams()
  return <ActivitySection workspaceId={workspaceId} />
}
