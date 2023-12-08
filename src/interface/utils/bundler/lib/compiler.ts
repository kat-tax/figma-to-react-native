import {initialize, build} from 'esbuild-wasm';
import {Barrier} from './barrier';

import react from '../plugins/react';
import svg from '../plugins/svg';
import png from '../plugins/png';

import type {InitializeOptions, BuildOptions} from 'esbuild-wasm';

const wasmURL = 'https://unpkg.com/esbuild-wasm@0.17.19/esbuild.wasm';

let _initialized = false;
let _initializing = false;

export interface Resolver {
  resolve(path: string):
    | Promise<string | Uint8Array>
    | Uint8Array
    | string,
}

export interface CompilerOptions extends InitializeOptions {}

export class Compiler {
  private readonly decoder: TextDecoder;
  private readonly barrier: Barrier;

  constructor(
    private readonly resolver: Resolver,
    private readonly options: CompilerOptions = {
      wasmURL,
      worker: true,
    }
  ) {
    this.decoder = new TextDecoder();
    this.barrier = new Barrier(true);
    if (!_initialized && !_initializing) {
      this.initialize();
    } else if(_initialized) {
      this.barrier.resume();
    }
  }

  private async initialize() {
    _initializing = true;
    await initialize({...this.options});
    _initialized = true;
    _initializing = false;
    this.barrier.resume();
  }

  public async compile(
    entryPoint: string,
    options: BuildOptions = {},
    importMap?: Record<string, string>,
  ) {
    await this.barrier.wait();
    const resolver = this.resolver;
    const result = await build({
      // Conform entry point
      entryPoints: [
        entryPoint.charAt(0) === '/'
          ? entryPoint.slice(1)
          : entryPoint,
      ],
      // ESBuild plugins
      plugins: [
        svg({resolver}),
        png({resolver}),
        // Always last
        react({resolver, importMap}),
      ],
      // User options
      ...options,
      // Required options
      bundle: true,
      write: false,
    });

    // Return the first output file
    const contents = result.outputFiles![0].contents;
    return this.decoder.decode(contents);
  }
}
