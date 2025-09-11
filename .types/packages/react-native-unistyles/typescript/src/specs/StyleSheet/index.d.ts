import { processColor } from 'react-native';
import type { StyleSheet as NativeStyleSheetType } from 'react-native';
import { parseBoxShadowString } from '../../core/parseBoxShadow';
import type { UnistylesBreakpoints, UnistylesThemes } from '../../global';
import type { CreateUnistylesStyleSheet } from '../../types';
import type { UnistylesStyleSheet as UnistylesStyleSheetSpec } from './UnistylesStyleSheet.nitro';
type UnistylesThemeSettings = {
    initialTheme: (() => keyof UnistylesThemes) | keyof UnistylesThemes;
    adaptiveThemes?: never | false;
} | {
    adaptiveThemes: boolean;
    initialTheme?: never;
} | {
    adaptiveThemes?: never;
    initialTheme?: never;
};
type UnistylesSettings = UnistylesThemeSettings & {
    CSSVars?: boolean;
    nativeBreakpointsMode?: 'pixels' | 'points';
};
export type UnistylesConfig = {
    settings?: UnistylesSettings;
    themes?: UnistylesThemes;
    breakpoints?: UnistylesBreakpoints;
};
export interface UnistylesStyleSheet extends UnistylesStyleSheetSpec {
    absoluteFillObject: typeof NativeStyleSheetType.absoluteFillObject;
    absoluteFill: typeof NativeStyleSheetType.absoluteFill;
    compose: typeof NativeStyleSheetType.compose;
    flatten: typeof NativeStyleSheetType.flatten;
    init(): void;
    create: CreateUnistylesStyleSheet;
    configure(config: UnistylesConfig): void;
    jsMethods: {
        processColor: typeof processColor;
        parseBoxShadowString: typeof parseBoxShadowString;
    };
}
type PrivateMethods = 'jsMethods' | 'addChangeListener' | 'init';
export declare const StyleSheet: Omit<UnistylesStyleSheet, PrivateMethods>;
export {};
//# sourceMappingURL=index.d.ts.map