import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { CheckIcon, Folder, PlusIcon, TagIcon } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import z from 'zod'
import {
  assignTagToFolder,
  createFolder,
  getGetFoldersQueryKey,
} from '@/api/folders/folders'
import type { GetTags200TagsItem } from '@/api/model'
import { TAG_COLOR_MAP, type TagColor } from '@/lib/tag-colors'
import { cn } from '@/lib/utils'
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
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'
import { Skeleton } from './ui/skeleton'

interface FolderCardProps extends React.ComponentProps<'div'> {
  folderId: string
  name: string
  itemCount: number
  subfolderCount: number
  tagIds: string[]
  workspaceTags: GetTags200TagsItem[]
  workspaceId: string
}

function FolderCard({
  folderId,
  name,
  itemCount,
  subfolderCount,
  tagIds,
  workspaceTags,
  workspaceId,
  className,
  ...props
}: FolderCardProps) {
  const qc = useQueryClient()
  const [assigningTagId, setAssigningTagId] = React.useState<string | null>(null)

  const folderTags = workspaceTags.filter((t) => tagIds.includes(t.id))

  async function handleAssignTag(tagId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (tagIds.includes(tagId)) return
    if (tagIds.length >= 3) {
      toast.error('Folders can have at most 3 tags')
      return
    }
    setAssigningTagId(tagId)
    const res = await assignTagToFolder(folderId, tagId)
    setAssigningTagId(null)
    if (res.status === 204) {
      qc.invalidateQueries({ queryKey: getGetFoldersQueryKey({ workspaceId }) })
    } else if (res.status === 409) {
      toast.error('Folder already has 3 tags')
    } else {
      toast.error('Failed to assign tag')
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
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='font-mono text-xs font-medium text-muted-foreground uppercase'>
            {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
          </span>
          {subfolderCount > 0 && (
            <span className='font-mono text-xs font-medium text-muted-foreground uppercase'>
              {subfolderCount} {subfolderCount === 1 ? 'SUBFOLDER' : 'SUBFOLDERS'}
            </span>
          )}
        </div>
        <div className='flex items-center gap-1.5'>
          {folderTags.map((tag) => (
            <span
              key={tag.id}
              title={tag.name}
              className={cn('size-2.5 rounded-full', TAG_COLOR_MAP[tag.color as TagColor].bg)}
            />
          ))}
          {workspaceTags.length > 0 && tagIds.length < 3 && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type='button'
                  onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                  className='flex size-4 items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
                  title='Assign tag'
                >
                  <TagIcon className='size-3' />
                </button>
              </PopoverTrigger>
              <PopoverContent className='w-48 p-1' align='end'>
                <p className='font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground px-2 py-1'>
                  Assign tag
                </p>
                {workspaceTags
                  .filter((t) => !tagIds.includes(t.id))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      type='button'
                      disabled={assigningTagId === tag.id}
                      onClick={(e) => handleAssignTag(tag.id, e)}
                      className='flex w-full items-center gap-2 px-2 py-1.5 hover:bg-primary/5 transition-colors cursor-pointer'
                    >
                      <span className={cn('size-2.5 rounded-full shrink-0', TAG_COLOR_MAP[tag.color as TagColor].bg)} />
                      <span className='font-mono text-xs truncate'>{tag.name}</span>
                    </button>
                  ))}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
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
