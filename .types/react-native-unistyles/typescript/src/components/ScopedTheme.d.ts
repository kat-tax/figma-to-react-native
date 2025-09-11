import React from 'react';
import type { UnistylesThemes } from '../global';
type ThemeProps = {
    name: keyof UnistylesThemes;
    invertedAdaptive?: never;
    reset?: never;
} | {
    name?: never;
    invertedAdaptive: boolean;
    reset?: never;
} | {
    name?: never;
    invertedAdaptive?: never;
    reset: boolean;
};
export declare const ScopedTheme: React.FunctionComponent<React.PropsWithChildren<ThemeProps>>;
export {};
//# sourceMappingURL=ScopedTheme.d.ts.map