import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3001,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/x-date-pickers'],
          exceljs: ['exceljs']
        }
      }
    },
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: !process.env.VITE_DEBUG_PROD,
        drop_debugger: !process.env.VITE_DEBUG_PROD,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}); 