import {defineConfig} from 'vite';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig({
  build: {
    sourcemap: true,
    outDir: 'build',
    lib: {
      entry: 'index.ts',
      formats: ['es'],
      fileName: 'index',
    },
  },
  resolve: {
    alias: {
      'path': 'path-browserify',
      'stream': 'readable-stream',
    },
  },
  plugins: [
    nodePolyfills({
      include: ['buffer'],
      globals: {process: true, Buffer: true},
    }),
  ],
});
