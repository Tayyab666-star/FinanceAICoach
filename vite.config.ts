import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Fix for client-side routing - serve index.html for all routes
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Configure dev server to handle client-side routing
  server: {
    historyApiFallback: true,
  },
  // Configure preview server for production builds
  preview: {
    historyApiFallback: true,
  },
});