import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { HistoryIcon, SettingsIcon, ShieldIcon, UsersIcon } from 'lucide-react'
import {
  InlineCodeContent,
  InlineCodeRoot,
  InlineCodeSeparator,
  InlineCodeText,
} from '@/components/inline-code'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_authenticated/$workspaceId/settings')({
  component: RouteComponent,
})

const NAV_ITEMS: {
  to: string
  label: string
  icon: React.ElementType
}[] = [
  {
    to: '/$workspaceId/settings/general',
    label: 'General',
    icon: SettingsIcon,
  },
  {
    to: '/$workspaceId/settings/members',
    label: 'Members',
    icon: UsersIcon,
  },
  {
    to: '/$workspaceId/settings/roles',
    label: 'Roles & Permissions',
    icon: ShieldIcon,
  },
  {
    to: '/$workspaceId/settings/activity',
    label: 'Activity',
    icon: HistoryIcon,
  },
]

function RouteComponent() {
  const { workspaceId } = Route.useParams()

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
            return (
              <Link
                key={item.to}
                to={item.to}
                params={{ workspaceId }}
                className='flex items-center gap-2.5 px-3 py-2 text-left font-mono text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer border-l-2'
                activeProps={{
                  className: 'bg-primary/10 text-primary border-primary',
                }}
                inactiveProps={{
                  className:
                    'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-transparent',
                }}
              >
                <Icon className='size-3.5 shrink-0' />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Separator orientation='vertical' className='h-auto' />

        <div className='flex-1 min-w-0'>
          <Outlet />
        </div>
      </div>
    </main>
  )
}
