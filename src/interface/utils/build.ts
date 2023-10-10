import {initialize, transform} from 'esbuild-wasm';
import {notify} from 'interface/telemetry';

import type {Settings} from 'types/settings';

const wasmURL = 'https://unpkg.com/esbuild-wasm@0.17.19/esbuild.wasm';

let _loading = false;
let _loaded = false;

export async function build(code: string, config: Settings) {
  if (!_loaded && !_loading) await init();
  return await transform(code, config?.esbuild);
}

export async function init() {
  try {
    _loading = true;
    await initialize({wasmURL, worker: true});
    _loaded = true;
  } catch(e) {
    notify(e, 'Failed to load esbuild');
  } finally {
    _loading = false;
  }
}

init();
