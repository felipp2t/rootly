import { revalidateLogic, useForm } from '@tanstack/react-form'
import {
  FileTextIcon,
  KeyIcon,
  LinkIcon,
  PilcrowIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import * as React from 'react'
import z from 'zod'
import { cn } from '@/shared/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Field, FieldError, FieldGroup } from './ui/field'
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
  })

  return (
    <Dialog open={dialogIsOpen} onOpenChange={(open) => setDialogIsOpen(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>NEW ITEM</DialogTitle>
        </DialogHeader>
        <form className='space-y-6 mt-6'>
          <createItemForm.Field
            name='type'
            children={(field) => (
              <div className='flex items-center'>
                {itemTypes.map((itemType) => {
                  const Icon = itemType.icon
                  const isActive = field.state.value === itemType.label
                  const isSecretType = field.state.value === 'secret'
                  return (
                    <button
                      type='button'
                      className={cn(
                        'bg-outline border border-accent flex-1 py-2.5 not-first:border-l-0 cursor-pointer text-muted-foreground text-xs font-mono font-medium flex gap-2 items-center justify-center',
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
                    children={(field) => (
                      <FileInput
                        value={field.state.value as File | null}
                        onChange={(file) => field.handleChange(file)}
                        onBlur={field.handleBlur}
                      />
                    )}
                  />
                </React.Activity>

                <React.Activity mode={type === 'link' ? 'visible' : 'hidden'}>
                  <createItemForm.Field
                    name='content'
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <div className='flex items-center border border-input focus-within:border-primary/50 rounded-none focus-within:outline-none focus-within:ring-0'>
                          <span className='px-3 py-2.5 bg-muted flex gap-2 items-center text-muted-foreground font-mono text-xs'>
                            <LinkIcon className='size-3' /> https://
                          </span>
                          <Input
                            id={field.name}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            value={field.state.value as string}
                            aria-invalid={isInvalid}
                            autoComplete='off'
                            type='text'
                            className='flex-1 px-3 py-2.5 border-0 outline-none focus-visible:ring-0 focus-visible:outline-none'
                          />
                        </div>
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
                          <Field data-invalid={isInvalid}>
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
              </>
            )}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
