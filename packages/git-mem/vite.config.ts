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
      include: ['path', 'stream', 'buffer', 'process'],
    }),
  ],
});
