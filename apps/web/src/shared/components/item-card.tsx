import { revalidateLogic, useForm } from '@tanstack/react-form'
import {
  type File,
  FileText,
  FileTextIcon,
  Key,
  KeyIcon,
  Link,
  LinkIcon,
  PilcrowIcon,
} from 'lucide-react'
import * as React from 'react'
import z from 'zod'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { FieldGroup } from './ui/field'

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
          <FieldGroup>
            <createItemForm.Field
              name='type'
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <div className='flex items-center'>
                    {itemTypes.map((itemType) => {
                      const Icon = itemType.icon
                      const isActive = field.state.value === itemType.label
                      return (
                        <button
                          type='button'
                          className={cn(
                            'bg-outline border border-accent px-4 py-2.5 not-first:border-l-0 cursor-pointer text-muted-foreground text-xs font-mono font-medium flex gap-2 items-center',
                            isActive &&
                              'bg-background border-x-0 border-t-0 border-b-2 border-primary text-primary',
                          )}
                          key={itemType.label}
                          onClick={() => field.handleChange(itemType.label)}
                        >
                          <Icon className='size-4' />
                          {itemType.label.toUpperCase()}
                        </button>
                      )
                    })}
                  </div>
                )
              }}
            />
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
