import {Compiler} from './lib/compiler';
import {Resolver} from './lib/resolver';

import react from './plugins/react';
import css from './plugins/css';
import png from './plugins/png';
import svg from './plugins/svg';

import type {BuildOptions} from 'esbuild-wasm';

export type {BuildOptions};

/**
 * Bundle a React application
 * @param entry The entry point of the application (e.g. /index.tsx)
 * @param files Virtual File System containing files needed to bundle the app
 * @param config ESBuild config https://esbuild.github.io/api/#bundle
 * @param importMap The import map used to determine external dependencies
 * @returns a string containing the bundled application code
 */
export async function bundle(
  entry: string,
  files: Map<string, string | Uint8Array>,
  config?: BuildOptions,
  importMap?: Record<string, string>,
): Promise<string> {

  const resolver = new Resolver(files);
  const compiler = new Compiler();

  return await compiler.compile(entry, {
    define: {'process.env.NODE_ENV': '"development"'},
    inject: ['import-react'],
    jsx: 'automatic',
    target: 'esnext',
    format: 'esm',
    jsxDev: true,
    ...config,
  }, [
    png({resolver}),
    svg({resolver}),
    css({resolver}),
    react({resolver, importMap}),
  ]);
}
