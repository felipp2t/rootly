import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, PlusIcon } from 'lucide-react'
import { Suspense } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  getGetTagsQueryKey,
  useCreateTag,
  useGetTagsSuspense,
} from '@/api/tags/tags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { TAG_COLOR_MAP, type TagColor } from '@/lib/tag-colors'
import { cn } from '@/lib/utils'

const TAG_COLORS: TagColor[] = [
  'blue',
  'green',
  'orange',
  'purple',
  'red',
  'yellow',
]

const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  color: z.enum(['blue', 'green', 'orange', 'purple', 'red', 'yellow']),
})

export function TagsSection({ workspaceId }: { workspaceId: string }) {
  return (
    <Suspense fallback={<TagsSectionSkeleton />}>
      <TagsSectionLoader workspaceId={workspaceId} />
    </Suspense>
  )
}

function TagsSectionLoader({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient()
  const { data: tagsRes } = useGetTagsSuspense({ workspaceId })
  const tags = tagsRes.status === 200 ? tagsRes.data.tags : []
  const createTag = useCreateTag()

  const form = useForm({
    validators: { onSubmit: createTagSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    defaultValues: { name: '', color: 'blue' as TagColor },
    onSubmit: async ({ value }) => {
      const res = await createTag.mutateAsync({
        data: { name: value.name, color: value.color, workspaceId },
      })

      if (res.status === 201) {
        queryClient.invalidateQueries({
          queryKey: getGetTagsQueryKey({ workspaceId }),
        })
        toast.success('Tag created')
        form.reset()
      } else if (res.status === 409) {
        toast.error('A tag with this name already exists')
      } else {
        toast.error('Failed to create tag')
      }
    },
  })

  return (
    <div className='flex flex-col gap-6'>
      <span className='font-mono text-sm font-bold uppercase tracking-wide'>
        Tags
      </span>

      <form
        className='flex flex-col gap-4'
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <div className='flex items-end gap-2'>
          <form.Field
            name='name'
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <div className='flex flex-col gap-1 flex-1 min-w-0'>
                  <span className='font-mono text-xs text-muted-foreground uppercase'>
                    Name
                  </span>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete='off'
                    placeholder='e.g. urgent'
                    className='border border-border rounded-none focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-0'
                  />
                  {isInvalid && (
                    <span className='font-mono text-xs text-destructive'>
                      {field.state.meta.errors[0]?.message}
                    </span>
                  )}
                </div>
              )
            }}
          />

          <form.Field
            name='color'
            children={(field) => (
              <div className='flex flex-col gap-1 shrink-0'>
                <span className='font-mono text-xs text-muted-foreground uppercase'>
                  Color
                </span>
                <div className='flex items-center gap-1.5 h-9'>
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      type='button'
                      onClick={() => field.handleChange(color)}
                      className={cn(
                        'size-5 rounded-full transition-all cursor-pointer',
                        TAG_COLOR_MAP[color].bg,
                        field.state.value === color
                          ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground/50'
                          : 'opacity-50 hover:opacity-100',
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          />

          <form.Subscribe selector={(s) => [s.isSubmitting]}>
            {([isSubmitting]) => (
              <Button
                type='submit'
                disabled={isSubmitting}
                className='cursor-pointer shrink-0'
              >
                {isSubmitting ? (
                  <Loader2Icon className='size-4 animate-spin' />
                ) : (
                  <PlusIcon className='size-4' />
                )}
                ADD
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>

      <div className='flex flex-col gap-2'>
        <span className='font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          {tags.length} {tags.length === 1 ? 'Tag' : 'Tags'}
        </span>
        {tags.length === 0 ? (
          <p className='font-mono text-xs text-muted-foreground'>No tags yet</p>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {tags.map((tag) => (
              <div
                key={tag.id}
                className='flex items-center gap-1.5 border border-border px-2 py-1'
              >
                <span
                  className={cn(
                    'size-2 rounded-full',
                    TAG_COLOR_MAP[tag.color as TagColor].bg,
                  )}
                />
                <span className='font-mono text-xs font-medium'>
                  {tag.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TagsSectionSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-5 w-16 rounded-none' />
      <div className='flex gap-2'>
        <Skeleton className='h-9 flex-1 rounded-none' />
        <Skeleton className='h-9 w-24 rounded-none' />
      </div>
    </div>
  )
}
