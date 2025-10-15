import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'https://backend-tc-sa-v2.onrender.com',
        changeOrigin: true,
        secure: true,
        // keep '/api' prefix so routes match backend
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
})

