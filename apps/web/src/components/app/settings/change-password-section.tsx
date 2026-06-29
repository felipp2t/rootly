import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { KeyRoundIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import z from 'zod'
import { useChangePassword } from '@/api/me/me'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const inputClassName = cn(
  'border border-border focus-visible:border-primary/50 rounded-none focus-visible:outline-none focus-visible:ring-0',
)

export function ChangePasswordSection() {
  const navigate = useNavigate()
  const { setAuthenticated } = useAuth()
  const changePasswordMutation = useChangePassword()

  const form = useForm({
    validators: { onSubmit: changePasswordSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      const response = await changePasswordMutation.mutateAsync({
        data: {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          confirmPassword: value.confirmPassword,
        },
      })

      if (response.status === 204) {
        toast.success('Password changed. Please sign in again.')
        // Password change revokes all sessions on the server (cookies cleared).
        setAuthenticated(false)
        navigate({ to: '/session' })
      } else if (response.status === 401) {
        toast.error('Current password is incorrect')
      } else if (response.status === 400) {
        toast.error('Invalid password. Please check the requirements.')
      } else {
        toast.error('Failed to change password. Please try again later.')
      }
    },
  })

  return (
    <div className='flex flex-col gap-4'>
      <span className='font-mono text-sm font-bold uppercase tracking-wide'>
        Change password
      </span>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup className='gap-4'>
          <form.Field
            name='currentPassword'
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <span className='font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Current password
                  </span>
                  <Input
                    id={field.name}
                    name={field.name}
                    type='password'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete='current-password'
                    className={inputClassName}
                  />
                  <FieldError>{field.state.meta.errors[0]?.message}</FieldError>
                </Field>
              )
            }}
          />

          <form.Field
            name='newPassword'
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <span className='font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    New password
                  </span>
                  <Input
                    id={field.name}
                    name={field.name}
                    type='password'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete='new-password'
                    className={inputClassName}
                  />
                  <FieldError>{field.state.meta.errors[0]?.message}</FieldError>
                </Field>
              )
            }}
          />

          <form.Field
            name='confirmPassword'
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <span className='font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Confirm new password
                  </span>
                  <Input
                    id={field.name}
                    name={field.name}
                    type='password'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete='new-password'
                    className={inputClassName}
                  />
                  <FieldError>{field.state.meta.errors[0]?.message}</FieldError>
                </Field>
              )
            }}
          />

          <Button
            type='submit'
            disabled={changePasswordMutation.isPending}
            className='cursor-pointer self-start'
          >
            {changePasswordMutation.isPending ? (
              <Loader2Icon className='size-4 animate-spin' />
            ) : (
              <KeyRoundIcon className='size-4' />
            )}
            CHANGE PASSWORD
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
