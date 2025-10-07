import type { UnistylesMiniRuntime } from '../../specs';
import type { UnistylesTheme } from '../../types';
export declare const SUPPORTED_STYLE_PROPS: readonly ["style", "contentContainerStyle"];
export type SupportedStyleProps = typeof SUPPORTED_STYLE_PROPS[number];
export type Mappings<T = {}> = (theme: UnistylesTheme, rt: UnistylesMiniRuntime) => Omit<Partial<T>, SupportedStyleProps> & {
    key?: string;
};
//# sourceMappingURL=types.d.ts.map