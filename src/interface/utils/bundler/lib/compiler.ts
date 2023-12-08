import {initialize, build} from 'esbuild-wasm';
import {Barrier} from './barrier';

import type {InitializeOptions, BuildOptions, Plugin} from 'esbuild-wasm';

const wasmURL = 'https://unpkg.com/esbuild-wasm@0.17.19/esbuild.wasm';

let _initialized = false;
let _initializing = false;

export interface CompilerOptions extends InitializeOptions {}

export class Compiler {
  private readonly decoder: TextDecoder;
  private readonly barrier: Barrier;

  constructor(
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
    plugins: Plugin[] = [],
  ) {
    await this.barrier.wait();
    const result = await build({
      plugins,
      entryPoints: [
        entryPoint.charAt(0) === '/'
          ? entryPoint.slice(1)
          : entryPoint,
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
