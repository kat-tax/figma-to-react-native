import type {Plugin} from 'esbuild';
import type {Resolver} from '../lib/resolver';

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
          return {
            path: '/' + args.path,
          };
        case 'import-statement':
          if (args.path === '@lingui/macro') {
            return {
              path: '/lingui-macro',
            }
          // Package import
          } else if (opts.importMap && opts.importMap[args.path]) {
            return {
              path: args.path,
              external: true,
            };
          // Local import
          } else {
            return {
              path: '/' + args.path,
            };
          }
        default:
          throw Error('not resolvable');
      }
    });
  
    build.onLoad({filter}, async (args) => {
      const isReactInject = args.path === '/import-react';
      const isLinguiMacro = args.path === '/lingui-macro';
      const isComponent = args.path.startsWith('/components/');
      const isStyles = args.path.startsWith('/styles');
      const isTheme = args.path.startsWith('/theme');
      return {
        contents: isReactInject
          ? `export * as React from 'react'`
          : isLinguiMacro
            ? `export const Trans = ({children}) => (<span>{children}</span>)`
            : await Promise.resolve(opts.resolver.resolve(args.path)),
        loader: isReactInject
          ? 'js'
          : isComponent || isLinguiMacro
            ? 'tsx'
            : isStyles || isTheme
              ? 'ts'
              : 'default',
        };
    });
  },
});
