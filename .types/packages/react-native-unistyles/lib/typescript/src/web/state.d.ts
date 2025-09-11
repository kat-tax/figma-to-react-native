import type { UnistylesBreakpoints } from '../global';
import type { UnistylesConfig } from '../specs/StyleSheet';
import type { AppBreakpoint, AppThemeName } from '../specs/types';
import type { UnistylesServices } from './types';
export declare class UnistylesState {
    private services;
    isInitialized: boolean;
    themes: Map<string, never>;
    cssThemes: Map<string, never>;
    themeName?: AppThemeName;
    CSSVars: boolean;
    private matchingBreakpoints;
    private _config;
    get breakpoint(): AppBreakpoint | undefined;
    breakpoints?: UnistylesBreakpoints;
    hasAdaptiveThemes: boolean;
    constructor(services: UnistylesServices);
    init: (config: UnistylesConfig) => void;
    private initThemes;
    private initSettings;
    private initBreakpoints;
    getConfig: () => UnistylesConfig;
}
//# sourceMappingURL=state.d.ts.map