import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    watch: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'astro:content': resolve(__dirname, './src/test/mocks/astro-content.ts'),
    },
  },
})