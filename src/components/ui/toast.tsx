'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'

export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const addToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    setToast({ message, type })

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  const ToastContainer = () => {
    if (!toast) return null

    return <SimpleToast message={toast.message} type={toast.type} />
  }

  return {
    addToast,
    ToastContainer,
  }
}

function SimpleToast({
  message,
  type,
}: {
  message: string
  type: 'success' | 'error' | 'info'
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center space-x-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out ${getStyles()} ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} `}
    >
      <CheckCircle className='h-5 w-5 text-green-600' />
      <p className='font-medium'>{message}</p>
    </div>
  )
}
