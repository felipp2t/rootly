import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, SaveIcon } from 'lucide-react'
import { Suspense } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import {
  getGetWorkspaceQueryKey,
  getGetWorkspacesQueryKey,
  useGetWorkspaceSuspense,
  useUpdateWorkspace,
} from '@/api/workspaces/workspaces'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useWorkspacePermissions } from '@/hooks/use-workspace-permissions'
import { cn } from '@/lib/utils'

const generalSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters long'),
})

export function GeneralSection({ workspaceId }: { workspaceId: string }) {
  return (
    <Suspense fallback={<GeneralSectionSkeleton />}>
      <GeneralSectionLoader workspaceId={workspaceId} />
    </Suspense>
  )
}

function GeneralSectionLoader({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient()
  const { data: workspaceRes } = useGetWorkspaceSuspense(workspaceId)
  const workspace =
    workspaceRes.status === 200 ? workspaceRes.data.workspace : null

  const { can } = useWorkspacePermissions(workspaceId)
  const canUpdate = can('workspace', 'update')

  const updateMutation = useUpdateWorkspace()

  const form = useForm({
    validators: { onSubmit: generalSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    defaultValues: {
      name: workspace?.name ?? '',
    },
    onSubmit: async ({ value }) => {
      const response = await updateMutation.mutateAsync({
        workspaceId,
        data: { name: value.name },
      })

      if (response.status === 204) {
        queryClient.invalidateQueries({
          queryKey: getGetWorkspaceQueryKey(workspaceId),
        })
        queryClient.invalidateQueries({
          queryKey: getGetWorkspacesQueryKey(),
        })
        toast.success('Workspace updated successfully')
        form.reset({ name: value.name })
      } else if (response.status === 404) {
        toast.error('Workspace not found')
      } else {
        toast.error('Failed to update workspace. Please try again later.')
      }
    },
  })

  return (
    <div className='flex flex-col gap-4'>
      <span className='font-mono text-sm font-bold uppercase tracking-wide'>
        General
      </span>

      <div className='flex flex-col gap-2'>
        <span className='font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          Workspace name
        </span>

        {canUpdate ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name='name'
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className='flex items-center gap-2'>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete='off'
                          className={cn(
                            'border border-border focus-visible:border-primary/50 rounded-none focus-visible:outline-none focus-visible:ring-0',
                          )}
                          placeholder='my-workspace'
                        />
                        <Button
                          type='submit'
                          disabled={updateMutation.isPending}
                          className='cursor-pointer shrink-0'
                        >
                          {updateMutation.isPending ? (
                            <Loader2Icon className='size-4 animate-spin' />
                          ) : (
                            <SaveIcon className='size-4' />
                          )}
                          SAVE
                        </Button>
                      </div>
                      <FieldError>
                        {field.state.meta.errors[0]?.message}
                      </FieldError>
                    </Field>
                  )
                }}
              />
            </FieldGroup>
          </form>
        ) : (
          <Input
            value={workspace?.name ?? ''}
            readOnly
            disabled
            className='border border-border rounded-none'
          />
        )}
      </div>
    </div>
  )
}

function GeneralSectionSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-5 w-24' />
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-3 w-32' />
        <Skeleton className='h-9 w-full' />
      </div>
    </div>
  )
}
