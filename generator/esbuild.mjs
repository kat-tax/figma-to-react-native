import {build} from 'esbuild';
import {writeFileSync} from 'fs';

const [flag] = process.argv.slice(2);
const watch = flag === '--watch';

// Plugin (node backend)
build({
  entryPoints: ['src/plugin.ts'],
  outfile: 'dist/plugin.js',
  target: ['node12'],
  platform: 'node',
  bundle: true,
  minify: !watch,
  incremental: watch,
  watch,
}).catch(console.error);

// Interface (browser frontend)
build({
  entryPoints: ['src/index.tsx'],
  outfile: 'dist/ui.js',
  target: ['es2019'],
  format: 'esm',
  bundle: true,
  write: false,
  minify: !watch,
  incremental: watch,
  watch: watch && {
    onRebuild(err, result) {
      if (err) {
        console.error(err);
      } else {
        output(result);
      }
    }
  }
}).then(output).catch(console.error);

function output(result) {
  const [html, css] = result.outputFiles;
  writeFileSync('dist/ui.html', [
    `<style>${css.text}</style>`,
    `<div id="app"></div>`,
    `<script>${html.text}</script>`,
  ].join('\n'));
}
