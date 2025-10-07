import type {Plugin} from 'esbuild-wasm';
import type {Resolver} from '../lib/resolver';

import {transformUnistyles} from '../lib/unistyles';
import {injectCodeInfo} from '../lib/debug';
import {Path} from '../lib/path';

interface PluginOptions {
  resolver: Resolver,
  importMap?: Record<string, string>,
}

export default (opts: PluginOptions): Plugin => ({
  name: 'react',
  setup: (build) => {
    const filter = /.*/;
    const counters = new Map<string, number>();

    build.onResolve({filter}, (args) => {
      switch (args.kind) {
        case 'entry-point':
          return {path: '/' + args.path};
        case 'import-statement':
          // Relative import, use importer path
          if (args.path.startsWith('.')) {
            return {path: Path.resolve(args.importer, args.path)};
          // LinguiJS macro, use custom logic
          } else if (args.path === '@lingui/react/macro') {
            return {path: '/lingui-macro'};
          // Found in import map, mark as external
          } else if (opts.importMap && opts.importMap[args.path]) {
            return {path: args.path, external: true};
          // Local import, use resolver
          } else {
            return {path: '/' + args.path};
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
      const isJS = isInject || args.path.endsWith('.js');
      const isTS = isStyles || isTheme || args.path.endsWith('.ts');
      const isTSX = isComponent || isLinguiMacro || args.path.endsWith('.tsx');
      // Get file contents
      let contents: string;
      // Automatic JSX
      if (isInject) {
        contents = `export * as React from 'react'`;
      // LinguiJS macros
      } else if (isLinguiMacro) {
        contents = 'export const useLingui = () => ({t: String.raw});';
      // Normal files (components, themes, styles, etc.)
      } else {
        const resolved = await Promise.resolve(opts.resolver.resolve(args.path));
        contents = typeof resolved === 'string' ? resolved : '';
      }
      // Component file modifications
      if (isTSX && isComponent) {
        // Inject codeInfo into JSX tree (fuck you react 19)
        // https://github.com/facebook/react/issues/32574
        contents = injectCodeInfo(contents, args.path);
        // Simulate Unistyles plugin
        contents = transformUnistyles(contents, args.path, counters);
      }
      // Return loader and file contents
      return {
        contents,
        loader: isJS ? 'js' : isTS ? 'ts' : isTSX ? 'tsx' : 'default',
      };
    });
  },
});
