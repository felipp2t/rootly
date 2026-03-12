import { FolderLibraryIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { authenticateUser, createAccount } from '@/api/auth/auth'
import { Button } from '@/shared/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { tokenStore } from '@/shared/lib/fetch'
import { cn } from '@/shared/lib/utils'

const signUpSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
})

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const signInForm = useForm({
    defaultValues: {
      email: '',
      name: '',
      password: '',
    },
    validators: { onSubmit: signUpSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    onSubmit: async ({ value }) => {
      const result = await createAccount({
        email: value.email,
        name: value.name,
        password: value.password,
      })

      if (result.status !== 201) {
        switch (result.status) {
          case 409:
            signInForm.setFieldMeta('email', (meta) => ({
              ...meta,
              isTouched: true,
              errorMap: {
                ...meta.errorMap,
                onServer: { message: result.data.message },
              },
            }))
            break
          default:
            toast.error(result.data.message)
        }
        return
      }

      const authResult = await authenticateUser({
        email: value.email,
        password: value.password,
      })

      if (authResult.status === 201) {
        tokenStore.set(
          authResult.data.accessToken,
          authResult.data.refreshToken,
        )
      } else {
        signInForm.setFieldMeta('email', (meta) => ({
          ...meta,
          isTouched: true,
          errorMap: {
            ...meta.errorMap,
            onServer: { message: authResult.data.message },
          },
        }))
      }
    },
  })

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <div className={cn('flex flex-col gap-6')}>
          <form
            id='sign-in-form'
            onSubmit={(e) => {
              e.preventDefault()
              signInForm.handleSubmit()
            }}
          >
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <a
                  href='/'
                  className='flex flex-col items-center gap-2 font-medium'
                >
                  <div className='flex size-8 items-center justify-center rounded-md'>
                    <HugeiconsIcon
                      icon={FolderLibraryIcon}
                      size={24}
                      color='#fff'
                    />
                  </div>
                  <span className='sr-only'>Acme Inc.</span>
                </a>
                <h1 className='text-xl font-bold'>Welcome to Rootly</h1>
                <FieldDescription>
                  Already have an account?{' '}
                  <Link to='/session' preload='viewport'>
                    Sign in
                  </Link>
                </FieldDescription>
              </div>

              <div className='flex flex-col items-center gap-4'>
                <signInForm.Field
                  name='email'
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete='off'
                          placeholder='your.email@example.com'
                          className={cn(
                            'dark:border-input/40',
                            'focus-visible:outline-none focus-visible:border-input/40 focus-visible:ring-2 focus-visible:ring-input/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          )}
                        />
                        <FieldError>
                          {field.state.meta.errors[0]?.message}
                        </FieldError>
                      </Field>
                    )
                  }}
                />

                <signInForm.Field
                  name='name'
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete='off'
                          placeholder='your name'
                          className={cn(
                            'dark:border-input/40',
                            'focus-visible:outline-none focus-visible:border-input/40 focus-visible:ring-2 focus-visible:ring-input/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          )}
                        />
                        <FieldError>
                          {field.state.meta.errors[0]?.message}
                        </FieldError>
                      </Field>
                    )
                  }}
                />

                <signInForm.Field
                  name='password'
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete='off'
                          placeholder='123456'
                          className={cn(
                            'dark:border-input/40',
                            'focus-visible:outline-none focus-visible:border-input/40 focus-visible:ring-2 focus-visible:ring-input/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          )}
                        />
                        <FieldError>
                          {field.state.meta.errors[0]?.message && (
                            <p>{field.state.meta.errors[0].message}</p>
                          )}
                        </FieldError>
                      </Field>
                    )
                  }}
                />
              </div>
              <signInForm.Subscribe selector={(state) => [state.canSubmit]}>
                {([canSubmit]) => (
                  <Field>
                    <Button
                      disabled={!canSubmit}
                      className={cn(
                        'cursor-pointer',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        'hover:outline-none hover:ring-2 hover:ring-primary/80 hover:ring-offset-2 hover:ring-offset-background',
                      )}
                      type='submit'
                    >
                      Create Account
                    </Button>
                  </Field>
                )}
              </signInForm.Subscribe>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  )
}
