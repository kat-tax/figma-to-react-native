import {Compiler, Resolver} from './lib/compiler';

import type {BuildOptions} from 'esbuild-wasm';

export async function build(
  entry: string,
  files: Map<string, string | Uint8Array>,
  config: BuildOptions,
  importMap?: Record<string, string>,
): Promise<string> {
  // console.log('[bundler]', entry, files)
  const resolver = new MemoryResolver(files);
  const compiler = new Compiler(resolver);
  return await compiler.compile(entry, {
    ...config,
    define: {'process.env.NODE_ENV': '"development"'},
    target: 'esnext',
    format: 'esm',
    jsx: 'automatic',
    jsxDev: true,
  }, importMap);
}

export class MemoryResolver implements Resolver {
  constructor(private readonly files: Map<string, string | Uint8Array>) {}
  public resolve(path: string) {
    if (!this.files.has(path))
      throw Error(`[bundler] ${path} not found`);
    return this.files.get(path)!;
  }
}
