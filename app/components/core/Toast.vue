<template>
  <Transition
    :name="animationType"
    appear
    @after-enter="onEnter"
    @before-leave="onLeave"
  >
    <div
      v-if="isVisible"
      class="fixed top-4 right-4 z-50 max-w-sm w-full mx-auto"
    >
      <div :class="toastClasses" class="rounded-lg shadow-lg border p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 mr-3 mt-0.5">
            <component :is="iconComponent" class="w-5 h-5" />
          </div>
          
          <div class="flex-1 min-w-0">
            <h4 v-if="title" :class="titleClasses" class="text-sm font-medium mb-1">
              {{ title }}
            </h4>
            <p :class="messageClasses" class="text-sm leading-relaxed">
              {{ message }}
            </p>
          </div>
          
          <button
            v-if="closable"
            @click="close"
            class="flex-shrink-0 ml-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'

export interface ToastProps {
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

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 5000,
  animation: 'slideDown',
  position: 'top-right',
  showProgress: true,
  closable: true
})

const emit = defineEmits<{
  close: [id?: string]
  enter: []
  leave: []
}>()

const isVisible = ref(false)
const progressWidth = ref(100)
let progressInterval: NodeJS.Timeout | null = null
let timeoutId: NodeJS.Timeout | null = null

const animationType = computed(() => {
  const animations = {
    slideDown: 'slide-down',
    slideUp: 'slide-up', 
    fade: 'fade',
    bounce: 'bounce',
    zoom: 'zoom'
  }
  return animations[props.animation] || 'slide-down'
})

const toastClasses = computed(() => {
  const typeClasses = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    loading: 'bg-gray-50 border-gray-200'
  }
  return typeClasses[props.type]
})

const titleClasses = computed(() => {
  const typeClasses = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900',
    loading: 'text-gray-900'
  }
  return typeClasses[props.type]
})

const messageClasses = computed(() => {
  const typeClasses = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
    loading: 'text-gray-800'
  }
  return typeClasses[props.type]
})

const progressClasses = computed(() => {
  const typeClasses = {
    success: 'bg-green-400',
    error: 'bg-red-400',
    warning: 'bg-yellow-400',
    info: 'bg-blue-400',
    loading: 'bg-gray-400'
  }
  return typeClasses[props.type]
})

const iconComponent = computed(() => {
  const icons = {
    success: () => h('div', { class: 'w-5 h-5 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center' }, [
      h('svg', { fill: 'white', viewBox: '0 0 20 20', class: 'w-3 h-3' }, [
        h('path', { 'fill-rule': 'evenodd', d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z', 'clip-rule': 'evenodd' })
      ])
    ]),
    error: () => h('div', { class: 'w-5 h-5 bg-red-500 rounded-lg sm:rounded-xl flex items-center justify-center' }, [
      h('svg', { fill: 'white', viewBox: '0 0 20 20', class: 'w-3 h-3' }, [
        h('path', { 'fill-rule': 'evenodd', d: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z', 'clip-rule': 'evenodd' })
      ])
    ]),
    warning: () => h('div', { class: 'w-5 h-5 bg-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center' }, [
      h('svg', { fill: 'white', viewBox: '0 0 20 20', class: 'w-3 h-3' }, [
        h('path', { 'fill-rule': 'evenodd', d: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z', 'clip-rule': 'evenodd' })
      ])
    ]),
    info: () => h('div', { class: 'w-5 h-5 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center' }, [
      h('svg', { fill: 'white', viewBox: '0 0 20 20', class: 'w-3 h-3' }, [
        h('path', { 'fill-rule': 'evenodd', d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z', 'clip-rule': 'evenodd' })
      ])
    ]),
    loading: () => h('div', { class: 'w-5 h-5 bg-gray-500 rounded-lg sm:rounded-xl flex items-center justify-center' }, [
      h('svg', { class: 'animate-spin w-3 h-3', fill: 'white', viewBox: '0 0 24 24' }, [
        h('path', { d: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z', opacity: '0.3' }),
        h('path', { d: 'M12 2v4c4.411 0 8 3.589 8 8h4c0-6.627-5.373-12-12-12z' })
      ])
    ])
  }
  return icons[props.type] || icons.info
})

const show = () => {
  isVisible.value = true
  startProgress()
}

const close = () => {
  isVisible.value = false
  emit('close', props.id)
}

const startProgress = () => {
  if (!props.showProgress || props.duration <= 0) return
  
  progressWidth.value = 100
  const interval = 50
  const decrement = (interval / props.duration) * 100
  
  progressInterval = setInterval(() => {
    progressWidth.value -= decrement
    if (progressWidth.value <= 0) {
      clearInterval(progressInterval!)
      close()
    }
  }, interval)
}

const startAutoClose = () => {
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
}

const onEnter = () => {
  emit('enter')
  startAutoClose()
}

const onLeave = () => {
  emit('leave')
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
}

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})

onMounted(() => {
  show()
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.4s ease-out;
}

.bounce-leave-active {
  animation: bounce-out 0.2s ease-in;
}

@keyframes bounce-in {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  50% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounce-out {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px);
    opacity: 0;
  }
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.2s ease-out;
}

.zoom-enter-from {
  transform: scale(0.8);
  opacity: 0;
}

.zoom-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
</style>
