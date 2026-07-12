import { createFileRoute } from '@tanstack/react-router'
import { AccentPreferenceSection } from '@/components/app/settings/accent-preference-section'
import { ThemePreferenceSection } from '@/components/app/settings/theme-preference-section'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_authenticated/account/preferences')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='max-w-md flex flex-col gap-8'>
      <ThemePreferenceSection />
      <Separator />
      <AccentPreferenceSection />
    </div>
  )
}
