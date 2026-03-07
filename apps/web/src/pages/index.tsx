import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='pl-24 pt-24 container mx-auto'>
      <div className='h-48 w-40 border rounded bg-zinc-950 flex flex-col items-center gap-2.5 justify-center cursor-pointer hover:bg-zinc-900/50 transition-colors px-1'>
        <HugeiconsIcon icon={PlusSignIcon} size={16} color='#fff' />

        <span className='text-sm flex items-center gap-1'>New Workspace</span>
      </div>
    </div>
  )
}
