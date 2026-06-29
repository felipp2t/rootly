import { createFileRoute, Link } from '@tanstack/react-router'
import { UserCogIcon } from 'lucide-react'
import { ChangePasswordSection } from '@/components/app/settings/change-password-section'
import {
  InlineCodeContent,
  InlineCodeRoot,
  InlineCodeSeparator,
  InlineCodeText,
} from '@/components/inline-code'

export const Route = createFileRoute('/_authenticated/account')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className='container mx-auto px-8 py-12 space-y-6'>
      <div className='flex flex-col gap-6'>
        <InlineCodeRoot>
          <InlineCodeContent>
            <Link to='/' className='group'>
              <InlineCodeText className='transition-colors group-hover:text-foreground'>
                Workspaces
              </InlineCodeText>
            </Link>
            <InlineCodeSeparator />
            <InlineCodeText className='text-primary'>Account</InlineCodeText>
            <InlineCodeSeparator />
          </InlineCodeContent>
        </InlineCodeRoot>

        <div className='flex items-center gap-4'>
          <UserCogIcon className='size-6 shrink-0 text-primary' />
          <h1 className='text-3xl font-bold font-mono'>ACCOUNT</h1>
        </div>
      </div>

      <div className='max-w-md'>
        <ChangePasswordSection />
      </div>
    </main>
  )
}
