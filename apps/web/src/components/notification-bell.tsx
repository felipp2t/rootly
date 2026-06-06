import { useQueryClient } from '@tanstack/react-query'
import { BellIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useAcceptInvite, useDeclineInvite } from '@/api/invites/invites'
import type { GetNotifications200NotificationsItem } from '@/api/model'
import {
  getGetNotificationsQueryKey,
  useGetNotifications,
  useReadNotification,
} from '@/api/notifications/notifications'
import {
  NotificationAction,
  NotificationActions,
  NotificationContent,
  NotificationHeader,
  NotificationIndicator,
  NotificationRoot,
  NotificationTitle,
} from '@/components/notification'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotificationSocket } from '@/hooks/use-notification-socket'
import { useAuth } from '@/lib/auth'

export function NotificationBell() {
  const { isAuthenticated } = useAuth()

  useNotificationSocket(isAuthenticated)

  const { data } = useGetNotifications({
    query: { enabled: isAuthenticated },
  })

  const notifications = data?.status === 200 ? data.data.notifications : []
  const unreadCount = notifications.filter((n) => n.readAt === null).length

  if (!isAuthenticated) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='relative flex size-8 items-center justify-center border border-border bg-card text-muted-foreground outline-none transition-colors cursor-pointer hover:bg-muted/30 data-[state=open]:bg-muted/30'>
        <BellIcon className='size-4' />
        {unreadCount > 0 && (
          <span className='absolute -top-1.5 -right-1.5 flex min-w-4 items-center justify-center px-1 h-4 border border-background bg-primary font-mono text-[10px] font-bold leading-none text-primary-foreground'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel className='flex items-center justify-between'>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className='font-mono text-xs text-muted-foreground'>
              {unreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className='px-2.5 py-6 text-center font-mono text-xs text-muted-foreground'>
            No notifications
          </p>
        ) : (
          <ScrollArea type='always'>
            <div className='max-h-96'>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationItem({
  notification,
}: {
  notification: GetNotifications200NotificationsItem
}) {
  const queryClient = useQueryClient()
  const readMutation = useReadNotification()
  const acceptMutation = useAcceptInvite()
  const declineMutation = useDeclineInvite()

  const isRead = notification.readAt !== null
  const inviteId =
    notification.metadata.type === 'workspace_invite'
      ? notification.metadata.inviteId
      : null
  const isInvite = inviteId !== null

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: getGetNotificationsQueryKey(),
    })
  }

  function handleMarkRead() {
    if (isRead) return
    readMutation.mutate(
      { notificationId: notification.id },
      { onSuccess: invalidate },
    )
  }

  function handleAccept() {
    if (!inviteId) return
    acceptMutation.mutate(
      { inviteId },
      {
        onSuccess: (res) => {
          if (res.status === 200) {
            toast.success('Invite accepted')
            if (!isRead) {
              readMutation.mutate({ notificationId: notification.id })
            }
            invalidate()
          } else if (res.status === 409) {
            toast.error('This invite is no longer valid')
            invalidate()
          } else {
            toast.error('Failed to accept invite')
          }
        },
        onError: () => toast.error('Failed to accept invite'),
      },
    )
  }

  function handleDecline() {
    if (!inviteId) return
    declineMutation.mutate(
      { inviteId },
      {
        onSuccess: (res) => {
          if (res.status === 204) {
            toast.success('Invite declined')
            if (!isRead) {
              readMutation.mutate({ notificationId: notification.id })
            }
            invalidate()
          } else if (res.status === 409) {
            toast.error('This invite is no longer valid')
            invalidate()
          } else {
            toast.error('Failed to decline invite')
          }
        },
        onError: () => toast.error('Failed to decline invite'),
      },
    )
  }

  return (
    <NotificationRoot unread={!isRead}>
      <NotificationHeader>
        <NotificationIndicator show={!isRead} />
        <NotificationTitle>{notification.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationContent>{notification.content}</NotificationContent>
      <NotificationActions>
        {isInvite && (
          <>
            <NotificationAction
              variant='default'
              pending={acceptMutation.isPending}
              onClick={handleAccept}
            >
              Accept
            </NotificationAction>
            <NotificationAction
              pending={declineMutation.isPending}
              onClick={handleDecline}
            >
              Decline
            </NotificationAction>
          </>
        )}
        {!isRead && (
          <NotificationAction
            variant='ghost'
            pending={readMutation.isPending}
            onClick={handleMarkRead}
          >
            Mark read
          </NotificationAction>
        )}
      </NotificationActions>
    </NotificationRoot>
  )
}
