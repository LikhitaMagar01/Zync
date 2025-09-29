import { defineStore } from 'pinia'
import { AuthApiService, type RegisterRequest } from '../services/api'

export const useSignupStore = defineStore('signup', {
    state: () => ({
        name: 'name one',
        isSubmitting: false,
        errors: {} as Record<string, string>,
    }),
    actions: {
        async submitSignup(formData: RegisterRequest) {
            this.isSubmitting = true
            this.errors = {}
            try {
                const response = await AuthApiService.register(formData)
                
                if (response.success) {
                    return { 
                        success: true, 
                        message: response.message || 'Signup successful!' 
                    }
                } else {
                    this.errors = response.errors || { general: response.message || 'Signup failed' }
                    return { 
                        success: false, 
                        message: response.message || 'Signup failed' 
                    }
                }
            } catch (error) {
                const errorMessage = 'An error occurred during signup. Please try again.'
                this.errors = { general: errorMessage }
                return { success: false, message: errorMessage }
            } finally {
                this.isSubmitting = false
            }
        },
        
        clearErrors() {
            this.errors = {}
        },
        
        setErrors(errors: Record<string, string>) {
            this.errors = errors
        }
    },
    getters: {
        getName: (state) => state.name,
        hasErrors: (state) => Object.keys(state.errors).length > 0,
        getFieldError: (state) => (field: string) => state.errors[field] || '',
    },
})