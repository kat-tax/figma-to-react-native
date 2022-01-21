import {build} from 'esbuild';
import {writeFileSync} from 'fs';

const [flag] = process.argv.slice(2);
const watch = flag === '--watch';

// Backend
build({
  entryPoints: ['src/plugin.ts'],
  outfile: 'dist/main.js',
  platform: 'node',
  target: ['node10.4'],
  bundle: true,
  watch,
}).catch(console.error);

// Frontend
build({
  entryPoints: ['src/index.tsx'],
  outfile: 'dist/ui.js',
  format: 'esm',
  write: false,
  bundle: true,
  watch: watch && {
    onRebuild(err, result) {
      if (err) {
        console.error(err);
      } else {
        output(result);
      }
    },
  },
}).then(output).catch(console.error);

function output(result) {
  const [html, css] = result.outputFiles;
  writeFileSync('dist/ui.html', [
    `<style>${css.text}</style>`,
    `<div id="app">`,
    `<script>${html.text}</script>`,
  ].join('\n'));
}
