import { createFileRoute } from '@tanstack/react-router'
import { ChangePasswordSection } from '@/components/app/settings/change-password-section'
import { UpdateProfileSection } from '@/components/app/settings/update-profile-section'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_authenticated/account/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='max-w-md flex flex-col gap-8'>
      <UpdateProfileSection />
      <Separator />
      <ChangePasswordSection />
    </div>
  )
}
