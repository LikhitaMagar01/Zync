<template>
  <div class="fixed inset-0 pointer-events-none z-50">
    <div v-if="topRightToasts.length > 0" class="absolute top-4 right-4 space-y-2">
      <Toast
        v-for="toast in topRightToasts"
        :key="toast.id"
        v-bind="toast"
        @close="removeToast"
      />
    </div>

    <div v-if="topLeftToasts.length > 0" class="absolute top-4 left-4 space-y-2">
      <Toast
        v-for="toast in topLeftToasts"
        :key="toast.id"
        v-bind="toast"
        @close="removeToast"
      />
    </div>

    <div v-if="topCenterToasts.length > 0" class="absolute top-4 left-1/2 transform -translate-x-1/2 space-y-2">
      <Toast
        v-for="toast in topCenterToasts"
        :key="toast.id"
        v-bind="toast"
        @close="removeToast"
      />
    </div>

    <div v-if="bottomRightToasts.length > 0" class="absolute bottom-4 right-4 space-y-2">
      <Toast
        v-for="toast in bottomRightToasts"
        :key="toast.id"
        v-bind="toast"
        @close="removeToast"
      />
    </div>

    <div v-if="bottomLeftToasts.length > 0" class="absolute bottom-4 left-4 space-y-2">
      <Toast
        v-for="toast in bottomLeftToasts"
        :key="toast.id"
        v-bind="toast"
        @close="removeToast"
      />
    </div>

    <div v-if="bottomCenterToasts.length > 0" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 space-y-2">
      <Toast
        v-for="toast in bottomCenterToasts"
        :key="toast.id"
        v-bind="toast"
        @close="removeToast"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Toast from './Toast.vue'
import { useToast } from '../../composables/useToast'

const { toasts, remove } = useToast()

const removeToast = (id: string | undefined) => {
  if (id) {
    remove(id)
  }
}

const topRightToasts = computed(() => 
  toasts.value.filter(toast => toast.position === 'top-right')
)

const topLeftToasts = computed(() => 
  toasts.value.filter(toast => toast.position === 'top-left')
)

const topCenterToasts = computed(() => 
  toasts.value.filter(toast => toast.position === 'top-center')
)

const bottomRightToasts = computed(() => 
  toasts.value.filter(toast => toast.position === 'bottom-right')
)

const bottomLeftToasts = computed(() => 
  toasts.value.filter(toast => toast.position === 'bottom-left')
)

const bottomCenterToasts = computed(() => 
  toasts.value.filter(toast => toast.position === 'bottom-center')
)
</script>
