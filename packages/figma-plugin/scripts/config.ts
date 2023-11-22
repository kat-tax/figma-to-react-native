import LightningCssModulesPlugin from 'esbuild-css-modules-plugin';
import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill';
import {esbuildPreactCompatPlugin} from './plugins/esbuild-preact-compat-plugin';

import type {BuildOptions} from 'esbuild';

export default (isDev: boolean) => <{main: BuildOptions, ui: BuildOptions}> {
  main: {
    entryPoints: ['./src/main.ts'],
    outfile: './build/main.js',
    platform: 'node',
    target: ['es2017'],
    minify: !isDev,
    bundle: true,
  },
  ui: {
    entryPoints: ['./src/ui.tsx'],
    outfile: './build/ui.js',
    target: ['es2020'],
    platform: 'browser',
    bundle: true,
    write: false,
    minify: !isDev,
    plugins: [
      esbuildPreactCompatPlugin(),
      LightningCssModulesPlugin({
        force: true,
        forceInlineImages: true,
        emitDeclarationFile: true,
        namedExports: true,
        localsConvention: 'camelCaseOnly',
      }),
      // @ts-ignore
      NodeModulesPolyfillPlugin({path: true}),
    ],
    define: {
      global: 'window',
    },
    loader: {
      '.gif': 'dataurl',
      '.jpg': 'dataurl',
      '.png': 'dataurl',
      '.svg': 'dataurl',
      '.tpl': 'base64',
    },
  },
};
