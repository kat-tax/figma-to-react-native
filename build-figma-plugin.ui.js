const fs = require('fs').promises;
const {NodeModulesPolyfillPlugin} = require('@esbuild-plugins/node-modules-polyfill');

// @ts-check
/**
 * @param buildOptions {Partial<import('esbuild').BuildOptions>}
 * @returns {Partial<import('esbuild').BuildOptions>}
 */
module.exports = (buildOptions) => {
  return {
    ...buildOptions,
    target: 'es2020',
    plugins: [
      ...buildOptions.plugins,
      NodeModulesPolyfillPlugin({
        path: true,
      }),
      // Hack: replace \22EF with \x12
      // Legacy octal escape sequences cannot be used in template literals
      // Caused by y-monaco loading folding.js
      {
        name: 'fix-y-monaco',
        setup(build) {
          build.onLoad({filter: /folding\.js$/}, async (args) => {
            const contents = await fs.readFile(args.path, 'utf8');
            const sanitized = contents.replace(/\\22EF/g, '\\x12');
            return {
              contents: sanitized,
              loader: 'js',
            };
          });
        },
      },
    ],
    loader: {
      '.tpl': 'base64',
    },
    define: {
      global: 'window',
    },
  };
}
