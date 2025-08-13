
// components/common/Toast.tsx
'use client'

import { useState, useEffect } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastProps {
  message: ToastMessage
  onClose: (id: string) => void
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id)
    }, message.duration || 5000)

    return () => clearTimeout(timer)
  }, [message.id, message.duration, onClose])

  const getIcon = () => {
    switch (message.type) {
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

  const getColorClasses = () => {
    switch (message.type) {
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

  return (
    <div className={`flex items-start p-4 rounded-lg border ${getColorClasses()} shadow-md`}>
      <div className="flex-shrink-0 mr-3">
        <span className="text-lg">{getIcon()}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{message.title}</h4>
        {message.message && (
          <p className="text-sm mt-1">{message.message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(message.id)}
        className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
      >
        <span className="sr-only">Fermer</span>
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}