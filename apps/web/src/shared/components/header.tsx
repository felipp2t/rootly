import { FoldersIcon } from 'lucide-react'

export function Header() {
  return (
    <header className='sticky top-0 z-10 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm'>
      <div className='container mx-auto flex h-full items-center gap-4 px-8'>
        <div className='flex items-center gap-2.5'>
          <FoldersIcon className='text-primary' size={20} />
          <span className='text-xl font-bold text-white uppercase font-mono tracking-widest'>
            Rootly
          </span>
        </div>

        <div className='flex-1' />

        <div className='w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300'>
          U
        </div>
      </div>
    </header>
  )
}
