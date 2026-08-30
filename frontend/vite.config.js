import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'https://kkncangkuangkulon.my.id/api_laravel/public',
      '/storage': 'https://kkncangkuangkulon.my.id/api_laravel/public'
    }
  },
  build: {
    // Split heavy vendor libs into their own chunks so the main bundle
    // stays small for the majority of pages (especially on mobile).
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@vladmandic/face-api') || id.includes('@mediapipe/tasks-vision') || id.includes('react-webcam')) {
              return 'face-vision';
            }
            if (id.includes('gsap') || id.includes('@gsap')) {
              return 'gsap';
            }
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
              return 'react-vendor';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
})
