import type {Plugin} from 'esbuild';
import type {Resolver} from '../lib/compiler';

interface PluginOptions {
  resolver: Resolver,
  importMap?: Record<string, string>,
}

export default (opts: PluginOptions): Plugin => ({
  name: 'react',
  setup: (build) => {
    const filter = /.*/;

    build.onResolve({filter}, (args) => {
      switch (args.kind) {
        case 'entry-point':
          return {path: '/' + args.path};
        case 'import-statement':
            if (opts.importMap && opts.importMap[args.path])
              return {path: args.path, external: true};
            return {path: '/' + args.path};
        default:
          throw Error('not resolvable');
      }
    });
  
    build.onLoad({filter}, async (args) => {
      const isTheme = args.path.startsWith('/theme');
      const isStyles = args.path.startsWith('/styles');
      const isComponent = args.path.startsWith('/components/');
      return {
        contents: await Promise.resolve(opts.resolver.resolve(args.path)),
        loader: isComponent
          ? 'tsx'
          : isStyles || isTheme
            ? 'ts'
            : 'default',
        };
    });
  },
});
