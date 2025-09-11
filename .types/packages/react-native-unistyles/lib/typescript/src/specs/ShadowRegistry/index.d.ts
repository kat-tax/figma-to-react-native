import type { UnistylesShadowRegistry as UnistylesShadowRegistrySpec } from './ShadowRegistry.nitro';
import type { ShadowNode, Unistyle, ViewHandle } from './types';
interface ShadowRegistry extends UnistylesShadowRegistrySpec {
    add(handle?: ViewHandle, styles?: Array<Unistyle>): void;
    remove(handle?: ViewHandle): void;
    link(node: ShadowNode, styles?: Array<Unistyle>): void;
    unlink(node: ShadowNode): void;
    flush(): void;
    setScopedTheme(themeName?: string): void;
    getScopedTheme(): string | undefined;
}
type PrivateMethods = 'add' | 'remove' | 'link' | 'unlink';
export declare const UnistylesShadowRegistry: Omit<ShadowRegistry, PrivateMethods>;
export {};
//# sourceMappingURL=index.d.ts.map