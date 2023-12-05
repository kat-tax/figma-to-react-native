import * as esbuild from 'esbuild-wasm';
import {Barrier} from './barrier';
import {Path} from './path';

const wasmURL = 'https://unpkg.com/esbuild-wasm@0.17.19/esbuild.wasm';

export interface Resolver {
  resolve(path: string): Promise<string> | string,
}

export interface CompilerOptions extends esbuild.InitializeOptions {}

export class Compiler {
  private readonly decoder: TextDecoder;
  private readonly barrier: Barrier;
  private static initialized = false;

  constructor(
    private readonly resolver: Resolver,
    private readonly options: CompilerOptions = {
      wasmURL,
      worker: true,
    }
  ) {
    this.decoder = new TextDecoder();
    this.barrier = new Barrier(true);
    // Call initialize only if it hasn't been called before
    if (!Compiler.initialized) {
      esbuild.initialize({...this.options})
        .then(() => {
          Compiler.initialized = true;
          this.barrier.resume();
        });
    // If already initialized, resume the barrier immediately
    } else {
      this.barrier.resume();
    }
  }

  public async compile(
    entryPoint: string,
    options: esbuild.BuildOptions = {},
    importMap?: Record<string, string>,
  ) {
    await this.barrier.wait();
    const result = await esbuild.build({
      entryPoints: [
        entryPoint.charAt(0) === '/'
          ? entryPoint.slice(1)
          : entryPoint,
      ],
      plugins: [
        {
          name: 'esbuild-wasm-bundler',
          setup: (build) => {
            const filter = /.*/;
            build.onResolve({filter}, (args) =>
              this.onResolveCallback(args, importMap));
            build.onLoad({filter}, (args) =>
              this.onLoadCallback(args));
          },
        },
      ],
      ...options,
      // required
      bundle: true,
      write: false,
    })
    const contents = result.outputFiles![0].contents;
    return this.decoder.decode(contents);
  }

  private onResolveCallback(
    args: esbuild.OnResolveArgs,
    importMap?: Record<string, string>,
  ) {
    // console.log('[bundler/onResolveCallback]', args);
    switch (args.kind) {
      case 'entry-point':
        return {path: '/' + args.path};
      case 'import-statement':
          if (importMap && importMap[args.path])
            return {path: args.path, external: true};
          // const dirname = Path.dirname(args.importer);
          // const path = Path.join(dirname, args.path);
          return {path: '/' + args.path};
      default:
        throw Error('not resolvable');
    }
  }

  private async onLoadCallback(
    args: esbuild.OnLoadArgs,
  ): Promise<esbuild.OnLoadResult> {
    // console.log('[bundler/onLoadCallback]', args);

    const extname = Path.extname(args.path);
    const contents = await Promise.resolve(this.resolver.resolve(args.path));
    
    const isComponent = args.path.startsWith('/components/');
    const isAsset = args.path.startsWith('/assets/');
    const isStyles = args.path.startsWith('/styles');
    const isTheme = args.path.startsWith('/theme');
    const isCss = extname === '.css';

    let loader: esbuild.Loader = 'default';

    if (isComponent) {
      loader = 'tsx';
    } else if (isAsset) {
      loader = 'base64';
    } else if (isCss) {
      loader = 'css';
    } else if (isStyles || isTheme) {
      loader = 'ts';
    }

    return {contents, loader};
  }
}
