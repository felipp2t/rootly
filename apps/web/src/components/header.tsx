import { Link, useNavigate } from '@tanstack/react-router'
import { FoldersIcon, LogOutIcon, SettingsIcon } from 'lucide-react'
import { useLogout } from '@/api/auth/auth'
import { NotificationBell } from '@/components/notification-bell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth'

export function Header() {
  const navigate = useNavigate()
  const { setAuthenticated } = useAuth()
  const logoutMutation = useLogout()

  function handleLogout() {
    setAuthenticated(false)
    navigate({ to: '/session' })
    logoutMutation.mutate()
  }

  return (
    <header className='sticky top-0 z-10 h-14 border-b border-border bg-background/80 backdrop-blur-sm'>
      <div className='container mx-auto flex h-full items-center gap-4 px-8'>
        <Link to='/' className='flex items-center gap-2.5'>
          <FoldersIcon className='text-primary' size={20} />
          <span className='text-xl font-bold text-foreground uppercase font-mono tracking-widest'>
            Rootly
          </span>
        </Link>

        <div className='flex-1' />

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='size-8 cursor-pointer rounded-full bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            >
              U
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-40'>
            <DropdownMenuItem asChild>
              <Link
                to='/account'
                className='flex items-center gap-2 cursor-pointer'
              >
                <SettingsIcon size={14} />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant='destructive'
              className='flex items-center gap-2 cursor-pointer'
              onSelect={handleLogout}
            >
              <LogOutIcon size={14} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
