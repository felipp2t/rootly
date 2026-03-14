import { FolderLibraryIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { z } from 'zod'
import { authenticateUser } from '@/api/auth/auth'
import { Button } from '@/shared/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { useAuth } from '@/shared/lib/auth'
import { cn } from '@/shared/lib/utils'

const signInSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
})

const sessionSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/session')({
  validateSearch: sessionSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated)
      throw redirect({ to: search.redirect ?? '/' })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { setAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { redirect = '/' } = Route.useSearch()

  const signInForm = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: { onSubmit: signInSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    onSubmit: async ({ value }) => {
      const result = await authenticateUser({
        email: value.email,
        password: value.password,
      })

      if (result.status !== 201) {
        signInForm.setFieldMeta('email', (meta) => ({
          ...meta,
          isTouched: true,
          errorMap: {
            ...meta.errorMap,
            onServer: { message: result.data.message },
          },
        }))
        return
      }

      setAuthenticated(true)
      navigate({ to: '/' })
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
                  Don&apos;t have an account?{' '}
                  <Link
                    to='/signup'
                    preload='viewport'
                    search={redirect !== '/' ? { redirect } : undefined}
                  >
                    Sign up
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
                      className={cn('cursor-pointer')}
                      type='submit'
                    >
                      Login
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
