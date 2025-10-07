# SYN

> The Web Bundler for Web Environments

Definition:
```ts
/**
 * Bundle a React application
 * @param entry Path to the app entry point (e.g. /index.tsx)
 * @param files Virtual File System containing files needed to bundle the app
 * @param config ESBuild config https://esbuild.github.io/api/#bundle
 * @param importMap The import map used to determine external dependencies
 * @returns a string containing the bundled application code
 */
export async function bundle(
  entry: string,
  files: Map<string, string | Uint8Array>,
  config?: BuildOptions,
  importMap?: Record<string, string>,
): Promise<string> {

  const resolver = new Resolver(files);
  const compiler = new Compiler();

  return await compiler.compile(entry, {
    define: {'process.env.NODE_ENV': '"development"'},
    inject: ['import-react'],
    jsx: 'automatic',
    target: 'esnext',
    format: 'esm',
    jsxDev: true,
    ...config,
  }, [
    png({resolver}),
    svg({resolver}),
    css({resolver}),
    react({resolver, importMap}),
  ]);
}
```

Usage:
```ts
// Import bundler
import {bundle} from 'web-bundler';

// Create a Virtual File System
const files: Map<string, string | Uint8Array> = new Map();

// Add code to VFS
for (const [name, component] of Object.entries(components)) {
  files.set(`/components/${name}`, component.code);
}

// Add assets to VFS
for (const [name, asset] of Object.entries(assets)) {
  const extension = asset.isVector ? 'svg' : 'png';
  const folder = asset.isVector ? 'vectors' : 'rasters';
  const path = `/assets/${folder}/${name}.${extension}`;
  files.set(path, asset.bytes);
}

// Add entrypoint to VFS
files.set('/index.tsx', mainComponent);

// Bundle VFS
const output = await bundle('/index.tsx', files);

// Print string output (or render in iframe)
console.log(output);
```
