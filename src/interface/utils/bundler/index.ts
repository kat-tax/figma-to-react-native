import {Compiler} from './lib/compiler';
import {Resolver} from './lib/resolver';

import react from './plugins/react';
import css from './plugins/css';
import png from './plugins/png';
import svg from './plugins/svg';

import type {BuildOptions} from 'esbuild-wasm';

export async function build(
  entry: string,
  files: Map<string, string | Uint8Array>,
  config: BuildOptions,
  importMap?: Record<string, string>,
): Promise<string> {
  const resolver = new Resolver(files);
  const compiler = new Compiler();

  return await compiler.compile(entry, {
    ...config,
    define: {'process.env.NODE_ENV': '"development"'},
    inject: ['import-react'],
    target: 'esnext',
    format: 'esm',
    jsx: 'automatic',
    jsxDev: true,
  }, [
    png({resolver}),
    svg({resolver}),
    css({resolver}),
    react({resolver, importMap}),
  ]);
}
