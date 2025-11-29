import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  base: './', // Relative paths for deployment
  build: {
    outDir: 'Docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        demos: resolve(__dirname, 'demos/index.html'),
        box: resolve(__dirname, 'demos/box.html'),
        carpet: resolve(__dirname, 'demos/carpet.html'),
        container: resolve(__dirname, 'demos/container.html'),
        sphere: resolve(__dirname, 'demos/sphere.html'),
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
