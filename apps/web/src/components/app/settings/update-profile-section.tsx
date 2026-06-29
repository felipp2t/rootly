import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, SaveIcon } from 'lucide-react'
import { Suspense } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { getGetMeQueryKey, useGetMeSuspense, useUpdateProfile } from '@/api/me/me'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const updateProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
})

const inputClassName = cn(
  'border border-border focus-visible:border-primary/50 rounded-none focus-visible:outline-none focus-visible:ring-0',
)

export function UpdateProfileSection() {
  return (
    <Suspense fallback={<UpdateProfileSectionSkeleton />}>
      <UpdateProfileSectionLoader />
    </Suspense>
  )
}

function UpdateProfileSectionLoader() {
  const queryClient = useQueryClient()
  const { data: meRes } = useGetMeSuspense()
  const user = meRes.status === 200 ? meRes.data : null

  const updateProfileMutation = useUpdateProfile()

  const form = useForm({
    validators: { onSubmit: updateProfileSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    defaultValues: {
      name: user?.name ?? '',
    },
    onSubmit: async ({ value }) => {
      const response = await updateProfileMutation.mutateAsync({
        data: { name: value.name },
      })

      if (response.status === 204) {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() })
        toast.success('Profile updated successfully')
        form.reset({ name: value.name })
      } else if (response.status === 400) {
        toast.error('Invalid name. Must be at least 3 characters.')
      } else {
        toast.error('Failed to update profile. Please try again later.')
      }
    },
  })

  return (
    <div className='flex flex-col gap-4'>
      <span className='font-mono text-sm font-bold uppercase tracking-wide'>
        Profile
      </span>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup className='gap-4'>
          <form.Field
            name='name'
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <span className='font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Name
                  </span>
                  <div className='flex items-center gap-2'>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete='name'
                      className={inputClassName}
                    />
                    <Button
                      type='submit'
                      disabled={updateProfileMutation.isPending}
                      className='cursor-pointer shrink-0'
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2Icon className='size-4 animate-spin' />
                      ) : (
                        <SaveIcon className='size-4' />
                      )}
                      SAVE
                    </Button>
                  </div>
                  <FieldError>{field.state.meta.errors[0]?.message}</FieldError>
                </Field>
              )
            }}
          />
        </FieldGroup>
      </form>
    </div>
  )
}

function UpdateProfileSectionSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-5 w-16' />
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-3 w-12' />
        <Skeleton className='h-9 w-full' />
      </div>
    </div>
  )
}
