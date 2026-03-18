import { revalidateLogic, useForm } from '@tanstack/react-form'
import { Folder, PlusIcon } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { createFolder } from '@/api/folders/folders'
import { cn } from '@/shared/lib/utils'
import { queryClient } from '../lib/query'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Field, FieldError, FieldGroup } from './ui/field'
import { Input } from './ui/input'

interface FolderCardProps extends React.ComponentProps<'div'> {
  name: string
  itemCount: number
}

function FolderCard({ name, itemCount, className, ...props }: FolderCardProps) {
  return (
    <div
      data-slot='folder-card'
      className={cn(
        'flex cursor-pointer flex-col justify-between gap-2.5 border border-border hover:border-primary/50 bg-card p-4 transition-all',
        className,
      )}
      {...props}
    >
      <div className='flex w-full items-center gap-2'>
        <Folder className='size-3.5 shrink-0 text-primary' />
        <span className='font-mono text-sm font-bold uppercase tracking-wide text-foreground truncate'>
          {name}
        </span>
      </div>
      <span className='font-mono text-xs font-medium text-muted-foreground uppercase'>
        {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
      </span>
    </div>
  )
}

type NewFolderCardProps = {
  workspaceId: string
  parentId?: string
  children: React.ReactNode
}

const newFolderSchema = z.object({
  name: z.string().min(3, 'Folder name must be at least 3 characters long'),
})

function NewFolderCard({
  workspaceId,
  parentId,
  children,
}: NewFolderCardProps) {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false)

  const createFolderForm = useForm({
    validators: { onSubmit: newFolderSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      const response = await createFolder({
        name: value.name,
        workspaceId,
        parentId,
      })

      if (response.status === 201) {
        queryClient.invalidateQueries({
          queryKey: [
            'http:',
            'localhost:3333',
            'api',
            'folders',
            { workspaceId },
          ],
        })
        toast.success('Folder created successfully')
        createFolderForm.reset()
        setDialogIsOpen(false)
      }

      if (response.status === 500) {
        toast.error('Failed to create folder. Please try again later.')
      }
    },
  })

  return (
    <Dialog open={dialogIsOpen} onOpenChange={(open) => setDialogIsOpen(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>NEW WORKSPACE</DialogTitle>
        </DialogHeader>
        <form
          className='space-y-6 mt-6'
          onSubmit={(e) => {
            e.preventDefault()
            createFolderForm.handleSubmit()
          }}
        >
          <FieldGroup>
            <createFolderForm.Field
              name='name'
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
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
                      placeholder='my-folder'
                    />
                    <FieldError>
                      {field.state.meta.errors[0]?.message}
                    </FieldError>
                  </Field>
                )
              }}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline' className='cursor-pointer'>
                CANCEL
              </Button>
            </DialogClose>
            <Button className='cursor-pointer'>
              <PlusIcon className='size-3.5' />
              CREATE
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { FolderCard, NewFolderCard }
