import { createFileRoute } from '@tanstack/react-router'
import { TagsSection } from '@/components/app/settings/tags-section'

export const Route = createFileRoute('/_authenticated/$workspaceId/settings/tags')({
  component: RouteComponent,
})

function RouteComponent() {
  const { workspaceId } = Route.useParams()
  return <TagsSection workspaceId={workspaceId} />
}
