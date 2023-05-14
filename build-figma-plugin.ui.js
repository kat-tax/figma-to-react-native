// @ts-check
/**
 * @param buildOptions {Partial<import('esbuild').BuildOptions>}
 * @returns {Partial<import('esbuild').BuildOptions>}
 */
module.exports = (buildOptions) => {
  return {
    ...buildOptions,
    target: 'es2020',
    loader: {
      '.tpl.tsx': 'base64',
      '.tpl.html': 'base64',
    },
    define: {
      global: 'window',
    },
  };
}
