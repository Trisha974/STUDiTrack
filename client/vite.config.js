import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              if (id.includes('firebase/auth')) {
                return 'vendor-firebase-auth'
              }
              if (id.includes('firebase/firestore')) {
                return 'vendor-firebase-firestore'
              }
              if (id.includes('firebase/storage')) {
                return 'vendor-firebase-storage'
              }
              return 'vendor-firebase-core'
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('xlsx')) {
              return 'vendor-xlsx'
            }
            return 'vendor-other'
          }
          if (id.includes('src/pages/Prof')) {
            return 'page-prof'
          }
          if (id.includes('src/pages/Student')) {
            return 'page-student'
          }
          if (id.includes('src/pages/Login')) {
            return 'page-login'
          }
        },
      },
    },
  },
})

