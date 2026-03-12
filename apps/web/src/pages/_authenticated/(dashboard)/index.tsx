import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/(dashboard)/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='pl-24 pt-24 container mx-auto'>
      <div className='grid grid-cols-8 gap-6'>
        <div className='h-48 max-w-40 w-full border rounded bg-zinc-950 flex flex-col items-center gap-2.5 justify-center cursor-pointer hover:bg-zinc-900/50 transition-colors px-6'>
          <p className='text-sm w-full text-center line-clamp-2'>
            My First Workspace fasfadsdas
          </p>
        </div>

        <div className='h-48 max-w-40 w-full border rounded bg-zinc-950 flex flex-col items-center gap-2.5 justify-center cursor-pointer hover:bg-zinc-900/50 transition-colors px-6'>
          <p className='text-sm w-full text-center line-clamp-2'>
            My Second Workspace fasfadsdas
          </p>
        </div>

        <div className='h-48 max-w-40 w-full border rounded bg-zinc-950 flex flex-col items-center gap-2.5 justify-center cursor-pointer hover:bg-zinc-900/50 transition-colors px-6'>
          <p className='text-sm w-full text-center line-clamp-2'>
            My Third Workspace fasfadsdas
          </p>
        </div>

        <div className='h-48 max-w-40 w-full border rounded flex flex-col items-center gap-2.5 justify-center cursor-pointer hover:bg-zinc-900/50 transition-colors px-1'>
          <HugeiconsIcon icon={PlusSignIcon} size={16} color='#fff' />

          <span className='text-sm flex items-center gap-1'>New Workspace</span>
        </div>
      </div>
    </div>
  )
}
