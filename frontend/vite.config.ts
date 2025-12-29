import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting: true,
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - order matters! Check specific packages first
          if (id.includes('node_modules')) {
            // Animation libraries (check before react to avoid conflicts)
            if (id.includes('framer-motion') || id.includes('@react-spring')) {
              return 'animation-vendor'
            }
            // React core - must be specific to avoid matching @react-spring, etc.
            if (
              id.includes('/react/') || 
              id.includes('/react-dom/') || 
              id.includes('/react/jsx-runtime') ||
              id.includes('/react/jsx-dev-runtime') ||
              (id.includes('react') && !id.includes('@') && !id.includes('react-'))
            ) {
              return 'react-vendor'
            }
            // Router
            if (id.includes('@tanstack/react-router') || id.includes('@tanstack/router')) {
              return 'router-vendor'
            }
            // UI components
            if (id.includes('@radix-ui')) {
              return 'radix-vendor'
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons-vendor'
            }
            // Other node_modules go into vendor chunk
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase limit slightly since we're splitting now
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
    hmr: {
      overlay: true,
    },
  },
})

