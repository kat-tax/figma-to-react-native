import React from 'react';
import type { PropsWithChildren } from 'react';
import type { UnistylesThemes } from '../global';
interface NamedThemeProps extends PropsWithChildren {
    name: keyof UnistylesThemes | undefined;
    previousScopedTheme?: string;
}
export declare const NamedTheme: React.FunctionComponent<NamedThemeProps>;
export {};
//# sourceMappingURL=NamedTheme.d.ts.map