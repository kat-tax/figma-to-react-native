import type {Plugin} from 'esbuild-wasm';
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
          // LinguiJS macro, use custom component
          if (args.path === '@lingui/macro') {
            return {
              path: '/lingui-macro',
            }
          // Found in import map, mark as external
          } else if (opts.importMap && opts.importMap[args.path]) {
            return {
              path: args.path,
              external: true,
            };
          // Local import, use resolver
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
      // Special paths
      const isTheme = args.path.startsWith('/theme');
      const isStyles = args.path.startsWith('/styles');
      const isComponent = args.path.startsWith('/components/');

      // Special files
      const isInject = args.path === '/import-react';
      const isLinguiMacro = args.path === '/lingui-macro';

      // Determine loader
      const isTS = isStyles || isTheme || args.path.endsWith('.ts');
      const isTSX = isComponent || isLinguiMacro || args.path.endsWith('.tsx');
      return {
        loader: isInject
          ? 'js'
          : isTS
            ? 'ts'
            : isTSX
              ? 'tsx'
              : 'default',
        contents: isInject
          ? `export * as React from 'react'`
          : isLinguiMacro
            ? 'export const Trans = ({children}) => (<span>{__trans__(children)}</span>)'
            : await Promise.resolve(opts.resolver.resolve(args.path)),
        };
    });
  },
});
