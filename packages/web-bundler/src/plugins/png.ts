import type {Plugin} from 'esbuild-wasm';
import type {Resolver} from '../lib/resolver';

interface PluginOptions {
  resolver: Resolver,
  importMap?: Record<string, string>,
}

export default (opts: PluginOptions): Plugin => ({
  name: 'png',
  setup: (build) => {
    const filter = /\.png$/;

    build.onResolve({filter}, (args) => {
      switch (args.kind) {
        case 'import-statement':
        case 'require-call':
        case 'dynamic-import':
        case 'require-resolve':
          return;
        default:
          return {external: true};
      }
    });

    build.onLoad({filter}, async (args) => {
      const data = await Promise.resolve(opts.resolver.resolve(args.path));
      const image = (data instanceof Uint8Array)
        ? await bytesToDataURL(data, 'image/png')
        : `data:image/png;base64,${data}`;
      return {
        contents: image,
        loader: 'text',
      };
    });
  },
});

async function bytesToDataURL(bytes: Uint8Array, type?: string): Promise<string> {
  const blob = new Blob([bytes as BlobPart], {type});
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
