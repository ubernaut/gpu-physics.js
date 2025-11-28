import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'WebGPUPhysics',
      fileName: 'webgpu-physics',
      formats: ['es'],
    },
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: '/demos/index.html',
  },
  assetsInclude: ['**/*.wgsl'],
});
