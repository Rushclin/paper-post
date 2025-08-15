'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
}

interface NotificationSystemProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function NotificationSystem({ notifications, onDismiss }: NotificationSystemProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return 'ℹ️'
    }
  }

  const getColorClasses = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  useEffect(() => {
    // Auto-dismiss notifications after their duration
    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          onDismiss(notification.id)
        }, notification.duration)

        return () => clearTimeout(timer)
      }
    })
  }, [notifications, onDismiss])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-md p-4 shadow-lg max-w-md ${getColorClasses(notification.type)}`}
          role="alert"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-xl">{getIcon(notification.type)}</span>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              <div className="mt-1 text-sm">{notification.message}</div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                type="button"
                onClick={() => onDismiss(notification.id)}
                className="inline-flex rounded-md p-1.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <span className="sr-only">Fermer</span>
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications
  }
}