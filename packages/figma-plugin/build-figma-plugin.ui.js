const {NodeModulesPolyfillPlugin} = require('@esbuild-plugins/node-modules-polyfill');

// @ts-check
/**
 * @param buildOptions {Partial<import('esbuild').BuildOptions>}
 * @returns {Partial<import('esbuild').BuildOptions>}
 */
module.exports = (buildOptions) => {
  return {
    ...buildOptions,
    plugins: [
      ...buildOptions.plugins,
      NodeModulesPolyfillPlugin({
        path: true,
      }),
    ],
    target: 'es2020',
    loader: {
      '.tpl': 'base64',
    },
    define: {
      global: 'window',
    },
  };
}
