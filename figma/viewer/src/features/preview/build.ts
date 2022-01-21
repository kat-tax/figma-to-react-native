import esbuild from 'esbuild-wasm';

const wasmURL = './node_modules/esbuild-wasm/esbuild.wasm';

export async function init() {
  await esbuild.initialize({wasmURL});
  esbuild.transform(code, options).then(result => { /* test */ });
  esbuild.build(options).then(result => { /* test */ });
}
