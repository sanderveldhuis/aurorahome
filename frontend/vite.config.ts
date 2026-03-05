import react from '@vitejs/plugin-react';
import { glConfig } from 'glidelite/vite';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  ...glConfig,
  plugins: [react()],
  root: path.resolve(__dirname, 'src'),
  publicDir: path.resolve(__dirname, 'public'),
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, '../node_modules/bootstrap')
    }
  },
  // Silence Sass deprecation warnings
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'import',
          'if-function',
          'color-functions',
          'global-builtin'
        ]
      }
    }
  }
});
