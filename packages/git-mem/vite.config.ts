import {defineConfig} from 'vite';

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
  ],
});
