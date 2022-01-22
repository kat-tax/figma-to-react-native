import esbuild from 'esbuild-wasm';

export async function init() {
  await esbuild.initialize({
    wasmURL: './node_modules/esbuild-wasm/esbuild.wasm',
  });
}

export async function build(_code: string) {
  return await esbuild.build({
    // TODO: config
  });
}
