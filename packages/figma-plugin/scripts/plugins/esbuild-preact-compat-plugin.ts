import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {findUp} from 'find-up';

import type {Plugin, PluginBuild} from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function esbuildPreactCompatPlugin(): Plugin {
  return {
    name: 'preact-compat',
    setup: (build: PluginBuild): void => {
      build.onResolve(
        {filter: /^react(?:-dom)?$/},
        async(): Promise<{path: string}> => {
          const preactCompatPath = await findUp(
            join('node_modules', 'preact', 'compat', 'dist', 'compat.module.js'),
            {cwd: __dirname}
          );
          if (typeof preactCompatPath === 'undefined')
            throw new Error('Cannot find `preact`');
          return {path: preactCompatPath};
        }
      );
    },
  };
}
