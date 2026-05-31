import { createFileRoute } from '@tanstack/react-router'
import { MembersSection } from '@/components/app/settings/members-section'

export const Route = createFileRoute(
  '/_authenticated/$workspaceId/settings/members',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { workspaceId } = Route.useParams()
  return <MembersSection workspaceId={workspaceId} />
}
