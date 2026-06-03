import { defineConfig } from 'vite';
import { resolve } from 'path';

// Trigger deployment with updated Pages settings

export default defineConfig({
  base: './',
  server: {
    watch: {
      ignored: ['**/asset/**']
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  }
});
