import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  FileTextIcon,
  KeyIcon,
  LinkIcon,
  Loader2Icon,
  MoreVerticalIcon,
  PilcrowIcon,
  PlusIcon,
  ShieldAlertIcon,
  Trash2Icon,
} from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { getGetFoldersQueryKey } from '@/api/folders/folders'
import {
  archiveItem,
  createItem,
  deleteItem,
  getGetItemsQueryKey,
  restoreItem,
  uploadItem,
} from '@/api/items/items'
import type { GetItems200ItemsItem } from '@/api/model'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import {
  Dialog,
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
import { FileInput } from './ui/file-input'
import { Input } from './ui/input'
import { SecretInput } from './ui/secret-input'
import { Skeleton } from './ui/skeleton'

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
    content: z
      .string()
      .min(1, 'Please enter a valid URL')
      .refine((value) => z.url().safeParse(`https://${value}`).success, {
        message: 'Please enter a valid URL',
      }),
  }),
  createItemSchemaCommon.extend({
    type: z.literal('text'),
    content: z.string().min(1, 'Content cannot be empty'),
  }),
])

const itemTypeIconMap = {
  document: FileTextIcon,
  link: LinkIcon,
  secret: KeyIcon,
  text: PilcrowIcon,
} as const

interface ItemCardProps extends React.ComponentProps<'div'> {
  item: GetItems200ItemsItem
}

function ItemCard({ item, className, ...props }: ItemCardProps) {
  const Icon = itemTypeIconMap[item.type]
  const isSecret = item.type === 'secret'
  const isArchived = item.archivedAt !== null
  const queryClient = useQueryClient()
  const [isMutating, setIsMutating] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const contentPreview = isSecret
    ? '••••••••••••'
    : item.content
      ? item.content.length > 60
        ? `${item.content.slice(0, 60)}…`
        : item.content
      : null

  async function invalidateItemQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetItemsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetFoldersQueryKey() }),
    ])
  }

  async function handleArchive() {
    setIsMutating(true)
    const response = await archiveItem(item.id)
    setIsMutating(false)

    if (response.status === 204) {
      await invalidateItemQueries()
      toast.success('Item archived')
    } else {
      toast.error('Failed to archive item. Please try again later.')
    }
  }

  async function handleRestore() {
    setIsMutating(true)
    const response = await restoreItem(item.id)
    setIsMutating(false)

    if (response.status === 204) {
      await invalidateItemQueries()
      toast.success('Item restored')
    } else {
      toast.error('Failed to restore item. Please try again later.')
    }
  }

  async function handleDelete() {
    setIsMutating(true)
    const response = await deleteItem(item.id)
    setIsMutating(false)

    if (response.status === 204) {
      await invalidateItemQueries()
      toast.success('Item deleted permanently')
      setDeleteDialogOpen(false)
    } else {
      toast.error('Failed to delete item. Please try again later.')
    }
  }

  return (
    <div
      data-slot='item-card'
      className={cn(
        'flex cursor-pointer flex-col justify-between gap-3 border-2 border-border hover:border-primary/50 bg-card p-4 transition-all',
        isSecret && 'hover:border-amber-500/50',
        isArchived && 'opacity-60',
        className,
      )}
      {...props}
    >
      <div className='flex w-full items-start justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <Icon
            className={cn(
              'size-4 shrink-0',
              isSecret ? 'text-amber-500' : 'text-muted-foreground',
            )}
          />
          <span className='font-mono text-sm font-bold tracking-wide text-foreground truncate'>
            {item.title}
          </span>
        </div>
        <div className='flex items-center gap-1.5 shrink-0'>
          {isArchived && (
            <span className='font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-muted text-muted-foreground border border-border'>
              Archived
            </span>
          )}
          <span
            className={cn(
              'font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5',
              isSecret
                ? 'bg-amber-500/10 text-amber-500'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {item.type}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className='cursor-pointer text-muted-foreground outline-none transition-colors hover:text-foreground'
            >
              <MoreVerticalIcon className='size-4' />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              onClick={(e) => e.stopPropagation()}
            >
              {isArchived ? (
                <>
                  <DropdownMenuItem
                    disabled={isMutating}
                    onClick={handleRestore}
                  >
                    <ArchiveRestoreIcon className='size-3.5' />
                    Restore
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant='destructive'
                    disabled={isMutating}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2Icon className='size-3.5' />
                    Delete permanently
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem disabled={isMutating} onClick={handleArchive}>
                  <ArchiveIcon className='size-3.5' />
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {contentPreview && (
        <p className='font-mono text-xs text-muted-foreground truncate'>
          {contentPreview}
        </p>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete item permanently</DialogTitle>
            <DialogDescription>
              This action cannot be undone. "{item.title}" will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              type='button'
              variant='destructive'
              disabled={isMutating}
              className='cursor-pointer'
              onClick={handleDelete}
            >
              {isMutating ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : (
                <Trash2Icon className='size-4' />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ItemCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot='item-card-skeleton'
      className={cn(
        'flex flex-col justify-between gap-3 border-2 border-border bg-muted p-4',
        className,
      )}
    >
      <div className='flex w-full items-start justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <Skeleton className='size-4 shrink-0 rounded-none' />
          <Skeleton className='h-3.5 w-[55%] rounded-none' />
        </div>
        <Skeleton className='h-5 w-12 rounded-none shrink-0' />
      </div>
      <Skeleton className='h-2.5 w-[75%] rounded-none' />
    </div>
  )
}

interface NewItemCardProps {
  children: React.ReactNode
  workspaceId: string
  folderId?: string
}

export function NewItemCard({
  children,
  workspaceId,
  folderId,
}: NewItemCardProps) {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const createItemForm = useForm({
    validators: { onSubmit: createItemSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    defaultValues: {
      title: '',
      type: 'document' as ItemType,
      content: '' as File | string,
    },
    onSubmit: async ({ value, formApi }) => {
      const result =
        value.type === 'document' && value.content instanceof File
          ? await uploadItem({
              title: value.title,
              workspaceId,
              folderId,
              file: value.content,
            })
          : await createItem({
              title: value.title,
              type: value.type,
              content:
                value.type === 'link'
                  ? `https://${value.content as string}`
                  : (value.content as string),
              workspaceId,
              folderId,
            })

      if (result.status !== 201) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: getGetItemsQueryKey({ workspaceId, parentId: folderId }),
      })
      formApi.reset()
      setDialogIsOpen(false)
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
                <Field data-invalid={isInvalid}>
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
              <Field>
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
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field>
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
                            isInvalid={isInvalid}
                          />
                          <FieldError>
                            {field.state.meta.errors[0]?.message}
                          </FieldError>
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
                        <Field data-invalid={isInvalid}>
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
                              isInvalid &&
                                'border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40',
                            )}
                          >
                            <span className='pl-3 pr-1 py-2.5 bg-muted flex gap-2 items-center text-muted-foreground font-mono text-xs'>
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
                                'flex-1 pr-3 pl-0 py-2.5 border-0 outline-none rounded-none',
                                'focus-visible:ring-0 focus-visible:outline-none aria-invalid:ring-0',
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
                        <Field data-invalid={isInvalid}>
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

export { ItemCard, ItemCardSkeleton }
