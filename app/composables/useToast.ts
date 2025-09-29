import { ref, readonly } from 'vue'

export interface ToastOptions {
  id?: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title?: string
  message: string
  duration?: number
  animation?: 'slideDown' | 'slideUp' | 'fade' | 'bounce' | 'zoom'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  showProgress?: boolean
  closable?: boolean
}

export interface Toast extends ToastOptions {
  id: string
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export const useToast = () => {
  const generateId = () => `toast-${++toastIdCounter}-${Date.now()}`

  const add = (options: ToastOptions): string => {
    const id = options.id || generateId()
    const toast: Toast = {
      id,
      type: 'info',
      duration: 5000,
      animation: 'slideDown',
      position: 'top-right',
      showProgress: true,
      closable: true,
      ...options
    }

    remove(id)
    
    toasts.value.push(toast)
    return id
  }

  const remove = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = () => {
    toasts.value = []
  }

  const success = (message: string, options?: Partial<ToastOptions>) => {
    return add({ ...options, type: 'success', message })
  }

  const error = (message: string, options?: Partial<ToastOptions>) => {
    return add({ ...options, type: 'error', message, duration: 7000 })
  }

  const warning = (message: string, options?: Partial<ToastOptions>) => {
    return add({ ...options, type: 'warning', message })
  }

  const info = (message: string, options?: Partial<ToastOptions>) => {
    return add({ ...options, type: 'info', message })
  }

  const loading = (message: string, options?: Partial<ToastOptions>) => {
    return add({ ...options, type: 'loading', message, duration: 0, closable: false })
  }

  return {
    toasts: readonly(toasts),
    add,
    remove,
    clear,
    success,
    error,
    warning,
    info,
    loading
  }
}
