import React from 'react';
import type { UnistylesBreakpoints } from './global';
import type { ScreenDimensions, ScreenInsets, ScreenSize, UnistylesTheme } from './types';
export type TUnistylesContext = {
    plugins: Array<string>;
    theme: UnistylesTheme;
    layout: {
        screen: ScreenSize;
        statusBar: ScreenDimensions;
        navigationBar: ScreenDimensions;
        insets: ScreenInsets;
        breakpoint: keyof UnistylesBreakpoints;
        orientation: 'landscape' | 'portrait';
    };
};
export declare const UnistylesContext: React.Context<TUnistylesContext | undefined>;
export declare const UnistylesProvider: ({ children }: {
    children: React.ReactNode;
}) => React.JSX.Element;
//# sourceMappingURL=UnistylesProvider.d.ts.map