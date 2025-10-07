import type { UnistylesMiniRuntime } from '../specs/UnistylesRuntime';
import { type AppTheme, type AppThemeName, ColorScheme, Orientation } from '../specs/types';
import { WebContentSizeCategory } from '../types';
import type { UnistylesServices } from './types';
export declare class UnistylesRuntime {
    private services;
    lightMedia: MediaQueryList | null;
    darkMedia: MediaQueryList | null;
    rootElement: Element | null;
    constructor(services: UnistylesServices);
    private getLightMedia;
    private getDarkMedia;
    get colorScheme(): ColorScheme;
    get themeName(): undefined;
    get contentSizeCategory(): WebContentSizeCategory;
    get breakpoints(): import("..").UnistylesBreakpoints;
    get breakpoint(): keyof import("..").UnistylesBreakpoints | undefined;
    get orientation(): Orientation;
    get isLandscape(): boolean;
    get isPortrait(): boolean;
    get theme(): never;
    get pixelRatio(): number;
    get screen(): {
        width: number;
        height: number;
    };
    get fontScale(): number;
    get insets(): {
        top: number;
        bottom: number;
        left: number;
        right: number;
        ime: number;
    };
    get statusBar(): import("../specs/StatusBar").UnistylesStatusBar;
    get rtl(): boolean;
    get hasAdaptiveThemes(): boolean;
    get navigationBar(): import("../specs/NavigtionBar").UnistylesNavigationBar;
    get miniRuntime(): UnistylesMiniRuntime;
    setTheme: (themeName: AppThemeName) => void;
    setAdaptiveThemes: (isEnabled: boolean) => void;
    setRootViewBackgroundColor: (color: string) => void;
    setImmersiveMode: () => void;
    updateTheme: (themeName: AppThemeName, updater: (currentTheme: AppTheme) => AppTheme) => void;
    getTheme: (themeName?: undefined, CSSVars?: boolean) => never;
}
//# sourceMappingURL=runtime.d.ts.map