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
  plugins: [
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'path', 'stream'],
      globals: { process: true, Buffer: true },
    }),
  ],
});
