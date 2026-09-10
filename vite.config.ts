import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 5173,
    open: false,
    watch: {
      ignored: ['**/src/server/**', '**/docs/**', '**/issues/**', '**/tests/**', '**/.agents/**'],
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('/node_modules/three/') || id.includes('\\node_modules\\three\\')) {
              return 'vendor-three';
            }
            if (
              id.includes('@react-three') ||
              id.includes('@react-spring') ||
              id.includes('three-stdlib')
            ) {
              return 'vendor-r3f';
            }
            if (id.includes('howler')) {
              return 'vendor-audio';
            }
            if (id.includes('react') || id.includes('zustand') || id.includes('scheduler')) {
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
});

