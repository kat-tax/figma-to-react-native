import type {Plugin} from 'esbuild';
import type {Resolver} from '../lib/resolver';

interface PluginOptions {
  resolver: Resolver,
  importMap?: Record<string, string>,
}

export default (opts: PluginOptions): Plugin => ({
  name: 'css',
  setup: (build) => {
    const filter = /\.css$/;
  
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
      const contents = await Promise.resolve(opts.resolver.resolve(args.path));
      return {
        contents,
        loader: 'css',
      };
    });
  },
});
