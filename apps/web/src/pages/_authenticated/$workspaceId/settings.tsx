import { createFileRoute, Link } from '@tanstack/react-router'
import { SettingsIcon, ShieldIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { GeneralSection } from '@/components/app/settings/general-section'
import { MembersSection } from '@/components/app/settings/members-section'
import { RolesSection } from '@/components/app/settings/roles-section'
import {
  InlineCodeContent,
  InlineCodeRoot,
  InlineCodeSeparator,
  InlineCodeText,
} from '@/components/inline-code'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/$workspaceId/settings')({
  component: RouteComponent,
})

type SettingsSection = 'general' | 'members' | 'roles'

const NAV_ITEMS: {
  id: SettingsSection
  label: string
  icon: React.ElementType
}[] = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'members', label: 'Members', icon: UsersIcon },
  { id: 'roles', label: 'Roles & Permissions', icon: ShieldIcon },
]

function RouteComponent() {
  const { workspaceId } = Route.useParams()
  const [activeSection, setActiveSection] = useState<SettingsSection>('roles')

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
            <Link to='/$workspaceId' params={{ workspaceId }} className='group'>
              <InlineCodeText className='transition-colors group-hover:text-foreground'>
                {workspaceId}
              </InlineCodeText>
            </Link>
            <InlineCodeSeparator />
            <InlineCodeText className='text-primary'>Settings</InlineCodeText>
            <InlineCodeSeparator />
          </InlineCodeContent>
        </InlineCodeRoot>

        <div className='flex items-center gap-4'>
          <SettingsIcon className='size-6 shrink-0 text-primary' />
          <h1 className='text-3xl font-bold font-mono'>SETTINGS</h1>
        </div>
      </div>

      <div className='flex gap-8'>
        <nav className='flex flex-col gap-1 w-52 shrink-0'>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type='button'
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-left font-mono text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-l-2 border-transparent',
                )}
              >
                <Icon className='size-3.5 shrink-0' />
                {item.label}
              </button>
            )
          })}
        </nav>

        <Separator orientation='vertical' className='h-auto' />

        <div className='flex-1 min-w-0'>
          {activeSection === 'roles' && (
            <RolesSection workspaceId={workspaceId} />
          )}
          {activeSection === 'general' && <GeneralSection />}
          {activeSection === 'members' && (
            <MembersSection workspaceId={workspaceId} />
          )}
        </div>
      </div>
    </main>
  )
}
