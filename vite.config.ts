
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.tsx', 'resources/css/app.css'],
      ssr: 'resources/js/ssr.tsx',
    }),
    react(),
    tailwindcss(),
  ],
  esbuild: {
    jsx: 'automatic',
  },
});
