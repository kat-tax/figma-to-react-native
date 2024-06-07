import init, {transform} from 'lightningcss-wasm';
import {extractRule} from './lib/extract';

import type * as LightningCSS from 'lightningcss-wasm';
import type {CssToReactNativeOptions, StyleSheetRegisterOptions, ExtractRuleOptions} from './lib/types';

export type {CssToReactNativeOptions};

let _loading = false;
let _loaded = false;

async function initWASM() {
  await init('https://esm.sh/lightningcss-wasm@1.22.1/lightningcss_node.wasm');
  _loading = false;
  _loaded = true;
}

/**
 * Converts a CSS file to a collection of style declarations that can be used with the StyleSheet API
 *
 * @param code - The CSS file contents
 * @param options - (Optional) Options for the conversion process
 * @returns An object containing the extracted style declarations
 */
export async function cssToReactNative(
  code: string,
  options: CssToReactNativeOptions = {},
): Promise<StyleSheetRegisterOptions> {
  if (_loading) {
    // TODO: use barrier instead of throwing
    throw new Error(
      'The WASM module is still loading. Please wait for the module to finish loading before using the `cssToReactNative` function.',
    );
  }
  if (!_loaded) {
    _loading = true;
    await initWASM();
  }

  // These will by mutated by `extractRule`
  const extractOptions: ExtractRuleOptions = {
    ...options,
    declarations: new Map(),
  };

  // Use LightningCSS to traverse the CSS AST
  transform({
    // This is ignored, but required
    filename: 'style.css',
    code: new TextEncoder().encode(code),
    visitor: {
      Rule(rule: LightningCSS.Rule) {
        // Extract the style declarations from the current rule
        extractRule(rule, extractOptions);
        // We have processed this rule, so now delete it from the AST
        return [];
      },
    },
  });

  // Return the extracted style declarations
  return Object.fromEntries(extractOptions.declarations);
}

/**
 * Converts a CSS file to a collection of style declarations that can be used with the StyleSheet API
 *
 * @param data - The object to transform to CSS
 */
export function buildCSS(data: {[s: string]: {[s: string]: unknown}}) {
  let css = '';
  for (const [id, styles] of Object.entries(data)) {
    css += `._${id.replace(/\:/g, '-')} { `;
    for (const [prop, value] of Object.entries(styles)) {
      // TODO: break this normalization out
      const _prop = prop === 'background' ? 'background-color' : prop;
      const _value = value === 'inline-flex' ? 'flex' : value;
      css += `${_prop}: ${_value}; `;
    }
    css += ' }\n';
  }
  return css;
}
