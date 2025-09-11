import type { LoaderContext } from '@rspack/core';
import type { UnistylesPluginOptions } from '../../plugin';
interface UnistylesLoaderOptions {
    babelPlugins?: string[];
    unistylesPluginOptions?: UnistylesPluginOptions;
}
export declare function unistylesLoader(this: LoaderContext<UnistylesLoaderOptions>, source: string): void;
export {};
//# sourceMappingURL=loader.d.ts.map