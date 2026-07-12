import { revalidateLogic, useForm } from '@tanstack/react-form'
import { Folder, MoreVerticalIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import z from 'zod'
import {
  createFolder,
  deleteFolder,
  getGetFoldersQueryKey,
} from '@/api/folders/folders'
import { cn } from '@/lib/utils'
import { queryClient } from '../lib/query'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import { Skeleton } from './ui/skeleton'

interface FolderCardProps extends React.ComponentProps<'div'> {
  folderId: string
  name: string
  itemCount: number
  subfolderCount: number
}

function FolderCard({
  folderId,
  name,
  itemCount,
  subfolderCount,
  className,
  ...props
}: FolderCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const response = await deleteFolder(folderId)
    setIsDeleting(false)

    if (response.status === 204) {
      await queryClient.invalidateQueries({
        queryKey: getGetFoldersQueryKey(),
      })
      toast.success('Folder deleted successfully')
      setDeleteDialogOpen(false)
    } else if (response.status === 409) {
      toast.error(response.data.message)
    } else {
      toast.error('Failed to delete folder. Please try again later.')
    }
  }

  return (
    <div
      data-slot='folder-card'
      className={cn(
        'flex cursor-pointer flex-col justify-between gap-2.5 border-2 border-border hover:border-primary/50 bg-card p-4 transition-all',
        className,
      )}
      {...props}
    >
      <div className='flex w-full items-center gap-2'>
        <Folder className='size-4.5 text-muted-foreground shrink-0' />
        <span className='font-mono text-sm font-bold tracking-wide text-foreground truncate'>
          {name}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className='ml-auto shrink-0 cursor-pointer text-muted-foreground outline-none transition-colors hover:text-foreground'
          >
            <MoreVerticalIcon className='size-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              variant='destructive'
              onClick={(e) => {
                e.stopPropagation()
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2Icon className='size-3.5' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='font-mono text-xs font-medium text-muted-foreground uppercase'>
            {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
          </span>
          {subfolderCount > 0 && (
            <span className='font-mono text-xs font-medium text-muted-foreground uppercase'>
              {subfolderCount}{' '}
              {subfolderCount === 1 ? 'SUBFOLDER' : 'SUBFOLDERS'}
            </span>
          )}
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className='flex flex-col gap-4'
        >
          <DialogHeader>
            <DialogTitle>Delete folder</DialogTitle>
            <DialogDescription>
              This action cannot be undone. "{name}" will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              type='button'
              variant='destructive'
              disabled={isDeleting}
              className='cursor-pointer'
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
            >
              <Trash2Icon className='size-4' />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

  function handleOpenDialog(open: boolean, callback?: () => void) {
    setDialogIsOpen(open)
    callback?.()
  }

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

        handleOpenDialog(false, () => createFolderForm.reset())
      }

      if (response.status === 500) {
        toast.error('Failed to create folder. Please try again later.')
      }
    },
  })

  return (
    <Dialog open={dialogIsOpen} onOpenChange={(open) => handleOpenDialog(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span className='text-primary'>{`//`}</span> NEW FOLDER
          </DialogTitle>
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
                    <FieldLabel
                      htmlFor={field.name}
                      className='font-mono text-sm text-muted-foreground block'
                    >
                      FOLDER NAME
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

function FolderCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot='folder-card-skeleton'
      className={cn(
        'flex flex-col justify-between gap-2.5 border-2 border-border bg-muted p-4',
        className,
      )}
    >
      <div className='flex w-full items-center gap-2'>
        <Skeleton className='size-4.5 shrink-0 rounded-none' />
        <Skeleton className='h-3.5 w-[45%] rounded-none' />
      </div>
      <Skeleton className='h-2.5 w-14 rounded-none' />
    </div>
  )
}

export { FolderCard, FolderCardSkeleton, NewFolderCard }
