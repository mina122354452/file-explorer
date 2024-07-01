// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './', // Use relative base path

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
