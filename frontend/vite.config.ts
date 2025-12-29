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
    chunkSizeWarningLimit: 600,
    // Optimize for production
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    // Optimize chunk splitting for better caching and parallel loading
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React core - critical, load first
            if (id.includes('react') && (id.includes('/react/') || id.includes('/react-dom/'))) {
              return 'react-vendor'
            }
            // Router - large but needed early
            if (id.includes('@tanstack/react-router')) {
              return 'router-vendor'
            }
            // Query - can load in parallel
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor'
            }
            // Animation library - can be lazy loaded
            if (id.includes('framer-motion')) {
              return 'animation-vendor'
            }
            // UI components - can load separately
            if (id.includes('@radix-ui')) {
              return 'ui-vendor'
            }
            // Icons - small, can be in main bundle
            if (id.includes('lucide-react')) {
              return 'icons-vendor'
            }
            // Everything else
            return 'vendor'
          }
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize asset inlining threshold
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    host: true, // Allow access from network (for mobile testing)
    strictPort: false,
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

