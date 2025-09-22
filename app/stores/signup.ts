import { defineStore } from 'pinia'

export const useSignupStore = defineStore('signup', {
    state: () => ({
        name: 'name one',
    }),
    actions: {
    },
    getters: {
        getName: (state) => state.name,
    },
})