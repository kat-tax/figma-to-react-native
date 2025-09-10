import type {Plugin} from 'esbuild-wasm';
import type {Resolver} from '../lib/resolver';

import {transformUnistyles} from '../lib/unistyles';
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
          // LinguiJS macro, use custom component
          } else if (args.path === '@lingui/macro') {
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
      const isTS = isStyles || isTheme || args.path.endsWith('.ts');
      const isTSX = isComponent || isLinguiMacro || args.path.endsWith('.tsx');
      // Custom file contents
      let contents: string;
      if (isInject) {
        contents = `export * as React from 'react'`;
      } else if (isLinguiMacro) {
        contents = 'export const Trans = ({children}) => (<span>{__trans__(children)}</span>)';
      } else {
        const resolved = await Promise.resolve(opts.resolver.resolve(args.path));
        contents = typeof resolved === 'string' ? resolved : '';
      }
      // Simulate Unistyles plugin
      if (isTSX && isComponent) {
        contents = transformUnistyles(contents, args.path, counters);
      }
      // Choose file type loader
      const loader = isInject
        ? 'js'
        : isTS
          ? 'ts'
          : isTSX
            ? 'tsx'
            : 'default';
      // Return loader and file contents
      return {
        loader,
        contents,
      };
    });
  },
});
