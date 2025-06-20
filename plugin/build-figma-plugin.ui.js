const fs = require('node:fs').promises;

// @ts-check
/**
 * @param buildOptions {Partial<import('esbuild').BuildOptions>}
 * @returns {Partial<import('esbuild').BuildOptions>}
 */
module.exports = (buildOptions) => {
  return {
    ...buildOptions,
    loader: {
      '.tpl': 'base64',
    },
    define: {
      global: 'window',
      'process.platform': JSON.stringify(process.platform),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG || ''),
    },
  };
}
