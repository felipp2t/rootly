import { createFileRoute } from '@tanstack/react-router'
import { ThemePreferenceSection } from '@/components/app/settings/theme-preference-section'

export const Route = createFileRoute('/_authenticated/account/preferences')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='max-w-md flex flex-col gap-8'>
      <ThemePreferenceSection />
    </div>
  )
}
