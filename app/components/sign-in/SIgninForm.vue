<template>
    <div class="min-h-screen bg-black flex items-center justify-center p-3 sm:p-5">
      <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md relative shadow-xl sm:shadow-2xl">
        <div class="absolute top-0 left-0 right-0 h-16 sm:h-20 overflow-hidden">
          <div class="absolute top-3 sm:top-5 left-3 sm:left-5 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-2 border-blue-100 rounded-full"></div>
          <div class="absolute top-3 sm:top-5 right-3 sm:right-5 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-2 border-blue-100 rounded-full"></div>
          <div class="absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 flex space-x-0.5 sm:space-x-1">
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-100 rounded-full"></div>
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-100 rounded-full"></div>
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-100 rounded-full"></div>
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-100 rounded-full"></div>
          </div>
        </div>
        <div class="text-center mb-4 sm:mb-6 mt-3 sm:mt-4">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-1 sm:mb-2">Sign In</h1>
          <p class="text-gray-600 text-sm sm:text-base">Welcome back! Please sign in to your account</p>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-3 sm:space-y-4" novalidate>
          <div v-if="errors.general" class="bg-red-100 border-2 border-red-500 rounded-lg p-2 sm:p-3 text-center">
            <p class="text-red-700 font-bold text-xs sm:text-sm">{{ errors.general }}</p>
          </div>
  
          <div class="space-y-1">
            <input
              v-model="formData.email"
              @blur="validateField('email')"
              type="email"
              placeholder="Email"
              class="w-full px-0 py-3 sm:py-4 border-0 border-b-2 bg-transparent text-black placeholder-gray-400 focus:outline-none transition-colors duration-300 text-sm sm:text-base"
              :class="errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'"
            />
            <div v-if="errors.email" class="text-red-600 font-medium text-xs sm:text-sm mt-1">
              {{ errors.email }}
            </div>
          </div>
  
          <div class="space-y-1">
            <input
              v-model="formData.password"
              @blur="validateField('password')"
              type="password"
              placeholder="Password"
              class="w-full px-0 py-3 sm:py-4 border-0 border-b-2 bg-transparent text-black placeholder-gray-400 focus:outline-none transition-colors duration-300 text-sm sm:text-base"
              :class="errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'"
            />
            <div v-if="errors.password" class="text-red-600 font-medium text-xs sm:text-sm mt-1">
              {{ errors.password }}
            </div>
          </div>
  
          <button 
            type="submit" 
            class="w-full py-3 sm:py-4 bg-black text-white border border-black rounded-lg sm:rounded-xl font-bold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none relative text-sm sm:text-base"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 bg-black text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>
  
        <div class="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-xs sm:text-sm">
              <span class="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <button 
            @click="handleGoogleSignIn"
            class="w-full py-3 sm:py-4 bg-white border border-gray-300 rounded-lg sm:rounded-xl flex items-center justify-center space-x-2 sm:space-x-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="text-gray-700 font-medium text-sm sm:text-base">Continue with Google</span>
          </button>
        </div>
  
        <div class="text-center mt-6 sm:mt-8">
          <p class="text-gray-600 text-xs sm:text-sm">
            Don't have an account? 
            <NuxtLink to="/signup" class="text-black font-bold hover:underline">Sign Up</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { signinSchema, type SigninFormData } from '../../utils/validation'
  import { useAuthStore } from '../../stores/auth'
  import { useHead, navigateTo } from 'nuxt/app'
  import { useToast } from '../../composables/useToast'
  
  useHead({
    title: 'Sign In'
  })
  
  const authStore = useAuthStore()
  const toast = useToast()
  
  const formData = reactive<SigninFormData>({
    email: '',
    password: ''
  })
  
  const errors = ref<Record<string, string>>({})
    
  const validateForm = () => {
    try {
      signinSchema.parse(formData)
      errors.value = {}
      return true
    } catch (error: any) {      
      if (error.issues) {
        errors.value = {}
        const processedFields = new Set()
        
        error.issues.forEach((err: any) => {
          if (err.path[0] && !processedFields.has(err.path[0])) {
            errors.value[err.path[0]] = err.message
            processedFields.add(err.path[0])
          }
        })   
      }
      return false
    }
  }
  
  const validateField = (field: string) => {
    try {
      const fieldSchema = signinSchema.pick({ [field]: true })
      fieldSchema.parse({ [field]: formData[field as keyof typeof formData] })
      
      if (errors.value[field]) {
        delete errors.value[field]
      }
    } catch (error: any) {
      if (error.issues && error.issues[0]) {
        const fieldError = error.issues[0]
        errors.value[field] = fieldError.message
      }
    }
  }
  
  const handleSubmit = async () => {
    const isValid = validateForm()
    
    if (!isValid) {
      return
    }
      
    try {
      const result = await authStore.login({
        email: formData.email,
        password: formData.password
      })
      
      if (result.success) {
        Object.assign(formData, {
          email: '',
          password: ''
        })
        errors.value = {}
        authStore.clearError()
        
        toast.success('Welcome back! Sign in successful.', {
          animation: 'slideDown',
          duration: 3000
        })
        
        setTimeout(async () => {
          await navigateTo('/home')
        }, 100)
      } else {
        toast.error(result.message || 'Sign in failed. Please check your credentials.', {
          animation: 'slideDown',
          duration: 5000
        })
        errors.value = { general: result.message || 'Sign in failed' }
      }
    } catch (error) {
      toast.error('Unable to connect to server. Please check your internet connection and try again.', {
        animation: 'slideDown',
        duration: 7000
      })
      errors.value = { general: 'An error occurred during sign in. Please try again.' }
    }
  }
  
  const handleGoogleSignIn = async () => {
    try {
      const popup = window.open(
        '/api/auth/google?select_account=true&flow=signin',
        'googleAuth',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no'
      )
      
      if (!popup) {
        toast.info('Opening Google Sign-In in new tab...', {
          animation: 'slideDown',
          duration: 3000
        })
        window.open('/api/auth/google?select_account=true&flow=signin', '_blank')
        return
      }
      setTimeout(() => {
        if (popup.closed) {
          toast.error('Popup was closed unexpectedly. Please try again.', {
            animation: 'slideDown',
            duration: 5000
          })
          return
        }
      }, 1000)
      
      // Listen for messages from popup
      const messageHandler = (event: MessageEvent) => {
        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
          // Clear the interval since we got the success message
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          
        // Update auth state and show success
        authStore.setUser(event.data.user)
        authStore.isAuthenticated = true
        
        const successMessage = event.data.isNewUser 
          ? 'Successfully signed up with Google!' 
          : 'Successfully signed in with Google!'
        
        toast.success(successMessage, {
          animation: 'slideDown',
          duration: 3000
        })
          
          // Redirect to home
          navigateTo('/home')
        }
      }
      
      window.addEventListener('message', messageHandler)

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          
          // Check if user is now authenticated
          setTimeout(async () => {
            await authStore.checkAuthStatus()
            if (authStore.isAuthenticated) {
              toast.success('Successfully signed in with Google!', {
                animation: 'slideDown',
                duration: 3000
              })
              await navigateTo('/home')
            }
          }, 1000)
        }
      }, 1000)
      
    } catch (error) {
      console.error('💥 Google Sign-In error:', error)
      toast.error('Google Sign-In failed. Please try again.', {
        animation: 'slideDown',
        duration: 5000
      })
    }
  }
  </script>