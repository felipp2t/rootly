import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { GetNotifications200NotificationsItem } from '@/api/model'
import {
  createWsTicket,
  getGetNotificationsQueryKey,
  type getNotificationsResponse,
} from '@/api/notifications/notifications'
import { WS_URL } from '@/lib/env'

type IncomingMessage = {
  type: 'notification'
  notification: GetNotifications200NotificationsItem
}

export function useNotificationSocket(enabled: boolean) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let attempts = 0
    let disposed = false

    function prependNotification(
      notification: GetNotifications200NotificationsItem,
    ) {
      queryClient.setQueryData<getNotificationsResponse>(
        getGetNotificationsQueryKey(),
        (current) => {
          if (current?.status !== 200) return current
          return {
            ...current,
            data: {
              ...current.data,
              notifications: [
                notification,
                ...current.data.notifications.filter(
                  (item) => item.id !== notification.id,
                ),
              ],
            },
          }
        },
      )
    }

    async function connect() {
      if (disposed) return

      const result = await createWsTicket()
      if (disposed || result.status !== 201) return

      const ticket = result.data.ticket
      socket = new WebSocket(`${WS_URL}/api/ws/notifications?ticket=${ticket}`)

      socket.onopen = () => {
        attempts = 0
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as IncomingMessage
          if (message.type === 'notification') {
            prependNotification(message.notification)
          }
        } catch {
          // ignore malformed frames
        }
      }

      socket.onclose = () => {
        if (disposed) return
        // exponential backoff capped at 30s
        const delay = Math.min(1000 * 2 ** attempts, 30_000)
        attempts += 1
        reconnectTimer = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      disposed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [enabled, queryClient])
}
