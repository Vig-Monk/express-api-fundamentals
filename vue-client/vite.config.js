import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // This rewrites the path if your backend doesn't expect the prefix
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
})
