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
  },
  optimizeDeps: {
    include: [
      'react-redux',
      'redux-persist',
      'redux-persist/integration/react',
      '@reduxjs/toolkit',
      'antd',
      'antd/locale/zh_CN',
      '@ant-design/icons',
      'rc-util',
      'rc-util/es/utils/get',
      'rc-util/es/utils/set'
    ],
    exclude: ['@remix-run/react']
  },
  ssr: {
    // 避免 SSR 期间的某些依赖问题
    noExternal: [
      'redux-persist',
      '@ant-design/icons',
      'antd',
      'rc-util',
      'rc-util/es/utils/get',
      'rc-util/es/utils/set',
      '@ant-design/icons-svg',
      '@ant-design/cssinjs',
      '@ctrl/tinycolor',
      '@rc-component/trigger',
      'rc-motion',
      'rc-resize-observer',
      'rc-textarea',
      'rc-input',
      'rc-field-form',
      'rc-checkbox',
      'rc-switch',
      'rc-select',
      'rc-cascader',
      'rc-picker',
      'rc-tree',
      'rc-table',
      'rc-tabs',
      'rc-dialog',
      'rc-drawer',
      'rc-dropdown',
      'rc-menu',
      'rc-input-number',
      'rc-pagination',
      'rc-progress',
      'rc-image',
      'rc-tooltip',
      'rc-tree-select',
      'rc-upload',
      'rc-util'
    ]
  }
});
