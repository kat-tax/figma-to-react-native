import type { UnistylesBreakpoints, UnistylesThemes } from '../../global';
import type { UnistylesPlugin, UnistylesConfig, UnistylesBridge } from '../../types';
export declare class UnistylesMockedRegistry {
    private unistylesBridge;
    config: UnistylesConfig;
    breakpoints: UnistylesBreakpoints;
    sortedBreakpointPairs: Array<[keyof UnistylesBreakpoints, UnistylesBreakpoints[keyof UnistylesBreakpoints]]>;
    plugins: Array<UnistylesPlugin>;
    themes: UnistylesThemes;
    themeNames: Array<keyof UnistylesThemes>;
    constructor(unistylesBridge: UnistylesBridge);
    addThemes: (themes: UnistylesThemes) => this;
    addBreakpoints: (breakpoints: UnistylesBreakpoints) => this;
    addConfig: (config: UnistylesConfig) => void;
    getTheme: (forName: keyof UnistylesThemes) => never;
    addPlugin: (plugin: UnistylesPlugin, notify?: boolean) => void;
    removePlugin: (plugin: UnistylesPlugin) => void;
    updateTheme: (name: keyof UnistylesThemes, theme: UnistylesThemes[keyof UnistylesThemes]) => void;
    hasTheme: (name: keyof UnistylesThemes) => boolean;
}
//# sourceMappingURL=UnistylesMockedRegistry.d.ts.map