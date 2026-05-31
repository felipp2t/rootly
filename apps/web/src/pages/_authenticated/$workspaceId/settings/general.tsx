import { createFileRoute } from '@tanstack/react-router'
import { GeneralSection } from '@/components/app/settings/general-section'

export const Route = createFileRoute(
  '/_authenticated/$workspaceId/settings/general',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <GeneralSection />
}
