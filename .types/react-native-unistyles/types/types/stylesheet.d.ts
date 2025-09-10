import type { BoxShadowValue, FilterFunction, ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { ShadowOffset, TransformStyles, UnistylesTheme } from './core';
import type { UnistylesBreakpoints } from '../global';
import type { UnistylesMiniRuntime } from '../core';
type NestedKeys = 'shadowOffset' | 'transform' | 'textShadowOffset' | 'boxShadow' | 'filter';
export type UnistyleView = Omit<ViewStyle, NestedKeys>;
export type UnistyleText = Omit<TextStyle, NestedKeys>;
export type UnistyleImage = Omit<ImageStyle, NestedKeys>;
type UnistyleNestedStyles = {
    shadowOffset?: ToDeepUnistyles<ShadowOffset>;
    textShadowOffset?: ToDeepUnistyles<ShadowOffset>;
    transform?: Array<ToDeepUnistyles<TransformStyles>>;
    boxShadow?: Array<ToDeepUnistyles<BoxShadowValue>> | string;
    filter?: Array<ToDeepUnistyles<FilterFunction>> | string;
};
type Variants = {
    variants?: {
        [variantName: string]: {
            [variant: string]: Omit<UnistylesValues, 'variants'>;
        };
    };
};
export type ToDeepUnistyles<T> = {
    [K in keyof T]?: T[K] | {
        [key in BreakpointsOrMediaQueries]?: T[K];
    };
};
type AllAvailableStyles = UnistyleView & UnistyleText & UnistyleImage & UnistyleNestedStyles;
export type AllAvailableKeys = keyof (UnistyleView & UnistyleText & UnistyleImage);
export type BreakpointsOrMediaQueries = keyof UnistylesBreakpoints | symbol;
export type UnistylesValues = {
    [propName in AllAvailableKeys]?: AllAvailableStyles[propName] | {
        [key in BreakpointsOrMediaQueries]?: AllAvailableStyles[propName];
    };
} & Variants & {
    [propName in NestedKeys]?: UnistyleNestedStyles[propName];
};
export type StyleSheet = {
    [styleName: string]: UnistylesValues | ((...args: any) => UnistylesValues);
};
export type StyleSheetWithSuperPowers = ((theme: UnistylesTheme, miniRuntime: UnistylesMiniRuntime) => StyleSheet) | StyleSheet;
export {};
//# sourceMappingURL=stylesheet.d.ts.map