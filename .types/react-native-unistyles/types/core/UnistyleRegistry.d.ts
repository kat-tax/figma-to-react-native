import type { UnistylesBridge, UnistylesConfig, UnistylesPlugin } from '../types';
import type { UnistylesBreakpoints, UnistylesThemes } from '../global';
export declare class UnistyleRegistry {
    private unistylesBridge;
    config: UnistylesConfig;
    plugins: Array<UnistylesPlugin>;
    themeNames: Array<keyof UnistylesThemes>;
    themes: UnistylesThemes;
    breakpoints: UnistylesBreakpoints;
    sortedBreakpointPairs: Array<[keyof UnistylesBreakpoints, UnistylesBreakpoints[keyof UnistylesBreakpoints]]>;
    constructor(unistylesBridge: UnistylesBridge);
    addThemes: (themes: UnistylesThemes) => {
        addBreakpoints: (breakpoints: UnistylesBreakpoints) => {
            addThemes: any;
            addConfig: (config: UnistylesConfig) => {
                addBreakpoints: any;
                addThemes: any;
            };
        };
        addConfig: (config: UnistylesConfig) => {
            addBreakpoints: any;
            addThemes: any;
        };
    };
    addBreakpoints: (breakpoints: UnistylesBreakpoints) => {
        addThemes: (themes: UnistylesThemes) => {
            addBreakpoints: any;
            addConfig: (config: UnistylesConfig) => {
                addBreakpoints: any;
                addThemes: any;
            };
        };
        addConfig: (config: UnistylesConfig) => {
            addBreakpoints: any;
            addThemes: any;
        };
    };
    addConfig: (config: UnistylesConfig) => {
        addBreakpoints: (breakpoints: UnistylesBreakpoints) => {
            addThemes: (themes: UnistylesThemes) => {
                addBreakpoints: any;
                addConfig: any;
            };
            addConfig: any;
        };
        addThemes: (themes: UnistylesThemes) => {
            addBreakpoints: any;
            addConfig: any;
        };
    };
    getTheme: (forName: keyof UnistylesThemes) => never;
    addPlugin: (plugin: UnistylesPlugin, notify?: boolean) => void;
    removePlugin: (plugin: UnistylesPlugin) => void;
    updateTheme: (name: keyof UnistylesThemes, theme: UnistylesThemes[keyof UnistylesThemes]) => void;
    hasTheme: (name: keyof UnistylesThemes) => boolean;
}
//# sourceMappingURL=UnistyleRegistry.d.ts.map