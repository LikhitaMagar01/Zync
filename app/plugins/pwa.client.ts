import { defineNuxtPlugin } from "nuxt/app";

// PWA Plugin - Service Worker Registration
export default defineNuxtPlugin(() => {
  if (process.client && 'serviceWorker' in navigator) {
    // Register service worker
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        // Check for updates
        registration.addEventListener('updatefound', () => {
          // Handle service worker updates if needed
        });
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
      
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      // Store the event for later use
      (window as any).deferredPrompt = e;
    });
    
    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      // Handle successful installation
    });
  }
})
