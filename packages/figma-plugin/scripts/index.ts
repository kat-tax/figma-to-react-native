import {build, context} from 'esbuild';
import {writeFileSync} from 'node:fs';
import config from './config';

const [flag] = Bun.argv.slice(2);
const isDev = flag === '--dev';

export async function buildBackend() {
  const cfg = config(isDev).main;
  if (isDev) {
    console.log('Watching for backend changes...');
    const ctx = await context(cfg);
    await ctx.watch();
  } else {
    console.log('Building backend...');
    build(cfg);
    console.log('Done.');
  }
}

export async function buildFrontend() {
  const cfg = config(isDev).ui;
  if (isDev) {
    console.log('Watching for frontend changes...');
    const ctx = await context(cfg);
    await ctx.watch();
  } else {
    console.log('Building frontend...');
    const res = await build(cfg);
    render(res);
    console.log('Done.');
  }

  function render(result: any) {
    const [html, css] = result.outputFiles;
    writeFileSync('./build/index.html', [
      `<!DOCTYPE html>`,
      `<head>`,
      `<meta charset="utf-8">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1">`,
      `<title>Plugin</title>`,
      `<style>${css.text}</style>`,
      `<style>body {height: 100%;}</style>`,
      `</head>`,
      `<body>`,
      `<script>${html.text}</script>`,
      `<script>document.body.classList.add('theme-' + window.FIGMA_MODE)</script>`,
      `</body>`,
      `</html>`,
    ].join('\n'));
  }
}

Promise.all([
  buildBackend(),
  buildFrontend()
]);
