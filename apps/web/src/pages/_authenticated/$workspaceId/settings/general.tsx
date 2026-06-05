import { createFileRoute } from '@tanstack/react-router'
import { DangerSection } from '@/components/app/settings/danger-section'
import { GeneralSection } from '@/components/app/settings/general-section'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute(
  '/_authenticated/$workspaceId/settings/general',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { workspaceId } = Route.useParams()
  return (
    <div className='flex flex-col gap-8'>
      <GeneralSection workspaceId={workspaceId} />
      <Separator />
      <DangerSection workspaceId={workspaceId} />
    </div>
  )
}
