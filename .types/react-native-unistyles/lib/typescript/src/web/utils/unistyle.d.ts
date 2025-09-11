import type { UnistylesBreakpoints } from '../../global';
import type { UnistyleDependency } from '../../specs/NativePlatform/NativePlatform.nitro';
import { ColorScheme } from '../../specs/types';
import type { StyleSheet, StyleSheetWithSuperPowers, UnistylesValues } from '../../types/stylesheet';
import type { UnistylesRuntime } from '../runtime';
import { type UniGeneratedStyle } from '../types';
export declare const schemeToTheme: (scheme: ColorScheme) => "light" | "dark";
export type UnistyleSecrets = {
    __uni__stylesheet: StyleSheetWithSuperPowers<StyleSheet>;
    __uni__key: string;
    __uni__args?: Array<any>;
    __stylesheetVariants: Record<string, string | boolean | undefined>;
};
export declare const assignSecrets: <T>(object: T, secrets: UnistyleSecrets) => T;
export declare const extractSecrets: (object: any) => {
    [x: string]: any;
} | undefined;
export declare const removeInlineStyles: (values: UnistylesValues) => {};
export declare const getMediaQuery: (query: string, allBreakpoints: Array<string>) => string;
export declare const extractUnistyleDependencies: (value: any) => UnistyleDependency[];
export declare const checkForProp: (value: any, prop: string) => boolean;
export declare const checkForAnimated: (value: any) => boolean;
export declare const isGeneratedUnistyle: (value: Record<string, any>) => value is UniGeneratedStyle;
export declare const convertTheme: (key: string, value: any, prev?: string) => [string, any];
export declare const getClosestBreakpointValue: <T>(runtime: UnistylesRuntime, values: Partial<Record<keyof UnistylesBreakpoints, T>>) => T | undefined;
//# sourceMappingURL=unistyle.d.ts.map