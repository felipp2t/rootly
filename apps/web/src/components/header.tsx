import { Link } from '@tanstack/react-router'
import { FoldersIcon, LogOutIcon, SettingsIcon } from 'lucide-react'
import { NotificationBell } from '@/components/notification-bell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  return (
    <header className='sticky top-0 z-10 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm'>
      <div className='container mx-auto flex h-full items-center gap-4 px-8'>
        <Link to='/' className='flex items-center gap-2.5'>
          <FoldersIcon className='text-primary' size={20} />
          <span className='text-xl font-bold text-white uppercase font-mono tracking-widest'>
            Rootly
          </span>
        </Link>

        <div className='flex-1' />

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='size-8 cursor-pointer rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
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
            <DropdownMenuItem variant='destructive' className='flex items-center gap-2 cursor-pointer'>
              <LogOutIcon size={14} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
