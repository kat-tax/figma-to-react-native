import {initialize, transform} from 'esbuild-wasm';

import type {Settings} from 'types/settings';

const wasmURL = 'https://unpkg.com/esbuild-wasm@0.14.39/esbuild.wasm';

let _loading = false;
let _loaded = false;

export async function build(code: string, config: Settings) {
  if (!_loaded && !_loading) await init();
  return await transform(code, config.preview?.transform);
}

export async function init() {
  try {
    _loading = true;
    await initialize({wasmURL, worker: true});
    _loaded = true;
  } catch(e) {
    console.error(e);
  } finally {
    _loading = false;
  }
}
