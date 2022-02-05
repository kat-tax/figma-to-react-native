import {build} from 'esbuild';

const [flag] = process.argv.slice(2);
const watch = flag === '--watch';

// Widget
build({
  entryPoints: ['src/Widget.tsx'],
  outfile: 'dist/main.js',
  format: 'esm',
  bundle: true,
  watch,
}).catch(console.error);
