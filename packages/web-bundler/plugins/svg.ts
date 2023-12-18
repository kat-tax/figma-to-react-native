import type {Plugin} from 'esbuild-wasm';
import type {Resolver} from '../lib/resolver';

interface PluginOptions {
  resolver: Resolver,
  importMap?: Record<string, string>,
}

export default (opts: PluginOptions): Plugin => ({
  name: 'svg',
  setup: (build) => {
    const filter = /\.svg$/;
  
    build.onResolve({filter}, (args) => {
      switch (args.kind) {
        case 'import-statement':
        case 'require-call':
        case 'dynamic-import':
        case 'require-resolve':
          return;
        default:
          return {external: true};
      }
    });
  
    build.onLoad({filter}, async (args) => {
      const data = await Promise.resolve(opts.resolver.resolve(args.path));
      const svg = (data instanceof Uint8Array)
        ? new TextDecoder('utf-8').decode(data)
        : data;
      return {
        contents: `export default () => ${svg}`,
        loader: 'tsx',
      };
    });
  },
});
