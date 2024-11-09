import { defineConfig } from 'vite';
import { vitePlugin as remix } from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, './app')
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
});
