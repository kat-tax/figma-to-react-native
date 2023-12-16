// @ts-check
/**
 * @param buildOptions {Partial<import('esbuild').BuildOptions>}
 * @returns {Partial<import('esbuild').BuildOptions>}
 */
module.exports = (buildOptions) => {
  return {
    ...buildOptions,
    target: 'es2017',
  };
}
