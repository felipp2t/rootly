import { revalidateLogic, useForm } from '@tanstack/react-form'
import {
  FileTextIcon,
  KeyIcon,
  LinkIcon,
  PilcrowIcon,
  PlusIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import * as React from 'react'
import z from 'zod'
import { cn } from '@/shared/lib/utils'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { FileInput } from './ui/file-input'
import { Input } from './ui/input'
import { SecretInput } from './ui/secret-input'

export const itemTypes = [
  {
    label: 'document',
    icon: FileTextIcon,
  },
  {
    label: 'link',
    icon: LinkIcon,
  },
  {
    label: 'secret',
    icon: KeyIcon,
  },
  {
    label: 'text',
    icon: PilcrowIcon,
  },
] as const

export type ItemType = (typeof itemTypes)[number]['label']

const createItemSchemaCommon = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  type: z.enum(['document', 'secret', 'link', 'text']),
})

const createItemSchema = z.discriminatedUnion('type', [
  createItemSchemaCommon.extend({
    type: z.literal('document'),
    content: z.file('Please upload a valid file'),
  }),
  createItemSchemaCommon.extend({
    type: z.literal('secret'),
    content: z.string().min(1, 'Secret value cannot be empty'),
  }),
  createItemSchemaCommon.extend({
    type: z.literal('link'),
    content: z.url('Please enter a valid URL'),
  }),
  createItemSchemaCommon.extend({
    type: z.literal('text'),
    content: z.string().min(1, 'Content cannot be empty'),
  }),
])

interface NewItemCardProps {
  children: React.ReactNode
}

export function NewItemCard({ children }: NewItemCardProps) {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false)

  const createItemForm = useForm({
    validators: { onSubmit: createItemSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    defaultValues: {
      title: '',
      type: 'document',
      content: '' as File | string,
    },
    onSubmit: async ({ value }) => {
      console.info('Form submitted with values:', value)
    },
  })

  return (
    <Dialog open={dialogIsOpen} onOpenChange={(open) => setDialogIsOpen(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span className='text-primary'>{`//`}</span> NEW ITEM
          </DialogTitle>
        </DialogHeader>
        <form
          className='space-y-6 mt-6'
          onSubmit={(e) => {
            e.preventDefault()
            createItemForm.handleSubmit()
          }}
        >
          <createItemForm.Field
            name='title'
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field className='gap-1.5' data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className='font-mono text-sm text-muted-foreground block'
                  >
                    TITLE
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete='off'
                    className={cn(
                      'border border-border rounded-none',
                      'focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-0',
                    )}
                    placeholder='item title'
                  />
                  <FieldError>{field.state.meta.errors[0]?.message}</FieldError>
                </Field>
              )
            }}
          />

          <createItemForm.Field
            name='type'
            children={(field) => (
              <Field className='gap-1.5'>
                <label
                  htmlFor={field.name}
                  className='font-mono text-sm text-muted-foreground block'
                >
                  TYPE
                </label>
                <div className='flex items-center'>
                  {itemTypes.map((itemType) => {
                    const Icon = itemType.icon
                    const isActive = field.state.value === itemType.label
                    const isSecretType = field.state.value === 'secret'
                    return (
                      <button
                        type='button'
                        className={cn(
                          'bg-outline border border-accent flex-1 py-2.5  cursor-pointer text-muted-foreground text-xs font-mono font-medium flex gap-2 items-center justify-center',
                          'not-first:border-l-0',
                          isActive &&
                            !isSecretType &&
                            'bg-background border-x-0 border-t-0 border-b-2 border-primary text-primary',
                          isActive &&
                            isSecretType &&
                            'bg-amber-500/20 border-x-0 border-y-0 border-b-2 border-b-amber-600 text-amber-500',
                        )}
                        key={itemType.label}
                        onClick={() => {
                          field.handleChange(itemType.label)
                          createItemForm.setFieldValue('content', '')
                        }}
                      >
                        <Icon className='size-4' />
                        {itemType.label.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </Field>
            )}
          />

          <createItemForm.Subscribe
            selector={(state) => state.values.type}
            children={(type) => (
              <>
                <React.Activity
                  mode={type === 'document' ? 'visible' : 'hidden'}
                >
                  <createItemForm.Field
                    name='content'
                    children={(field) => {
                      return (
                        <Field className='gap-1.5'>
                          <FieldLabel
                            htmlFor={`${type}-content`}
                            className='font-mono text-sm text-muted-foreground block'
                          >
                            FILE
                          </FieldLabel>
                          <FileInput
                            value={field.state.value as File | null}
                            onChange={(file) => field.handleChange(file)}
                            onBlur={field.handleBlur}
                          />
                        </Field>
                      )
                    }}
                  />
                </React.Activity>

                <React.Activity mode={type === 'link' ? 'visible' : 'hidden'}>
                  <createItemForm.Field
                    name='content'
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field className='gap-1.5' data-invalid={isInvalid}>
                          <FieldLabel
                            htmlFor={`${type}-content`}
                            className='font-mono text-sm text-muted-foreground block'
                          >
                            URL
                          </FieldLabel>
                          <div
                            className={cn(
                              'flex items-center border border-input rounded-none',
                              'focus-within:border-primary/50 focus-within:outline-none focus-within:ring-0',
                            )}
                          >
                            <span className='px-3 py-2.5 bg-muted flex gap-2 items-center text-muted-foreground font-mono text-xs'>
                              <LinkIcon className='size-3' /> https://
                            </span>
                            <Input
                              id={field.name}
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              value={field.state.value as string}
                              aria-invalid={isInvalid}
                              autoComplete='off'
                              type='text'
                              className={cn(
                                'flex-1 px-3 py-2.5 border-0 outline-none rounded-none',
                                'focus-visible:ring-0 focus-visible:outline-none',
                              )}
                            />
                          </div>
                          <FieldError className='ml-26'>
                            {field.state.meta.errors[0]?.message}
                          </FieldError>
                        </Field>
                      )
                    }}
                  />
                </React.Activity>

                <React.Activity mode={type === 'secret' ? 'visible' : 'hidden'}>
                  <FieldGroup>
                    <createItemForm.Field
                      name='content'
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field className='gap-1' aria-invalid={isInvalid}>
                            <FieldLabel
                              htmlFor={`${type}-content`}
                              className='font-mono text-sm text-muted-foreground block'
                            >
                              SECRET VALUE
                            </FieldLabel>
                            <SecretInput
                              id={field.name}
                              name={field.name}
                              value={field.state.value as string}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              aria-invalid={
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              }
                            />
                            <FieldError>
                              {field.state.meta.errors[0]?.message}
                            </FieldError>
                          </Field>
                        )
                      }}
                    />
                    <div className='bg-amber-500/10 border border-orange-600/20 flex items-center w-fit gap-2 px-3 py-2'>
                      <ShieldAlertIcon className='text-amber-500 size-4' />
                      <p className='font-mono text-xs text-amber-500'>
                        This value will be encrypted at rest
                      </p>
                    </div>
                  </FieldGroup>
                </React.Activity>

                <React.Activity mode={type === 'text' ? 'visible' : 'hidden'}>
                  <createItemForm.Field
                    name='content'
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field className='gap-1.5' data-invalid={isInvalid}>
                          <FieldLabel
                            htmlFor={`${type}-content`}
                            className='font-mono text-sm text-muted-foreground block'
                          >
                            CONTENT
                          </FieldLabel>
                          <textarea
                            id={`${type}-content`}
                            name={field.name}
                            value={field.state.value as string}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder='Write your text content here...'
                            className={cn(
                              'resize-none rounded-none p-4 text-sm w-full h-40 bg-outline border border-accent',
                              'focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-0',
                              'placeholder:font-mono placeholder:text-xs placeholder:text-muted-foreground placeholder:font-medium',
                              'disabled:pointer-events-none',
                              'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
                            )}
                          />
                          <FieldError>
                            {field.state.meta.errors[0]?.message}
                          </FieldError>
                        </Field>
                      )
                    }}
                  />
                </React.Activity>
              </>
            )}
          />

          <div className='flex items-center justify-end gap-2'>
            <Button
              variant='outline'
              type='button'
              className='cursor-pointer'
              onClick={() => setDialogIsOpen(false)}
            >
              CANCEL
            </Button>
            <Button type='submit' className='cursor-pointer'>
              <PlusIcon />
              CREATE
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
