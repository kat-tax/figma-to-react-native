import type { UnistylesThemes, UnistylesBreakpoints } from '../../global';
export declare class UnistylesMockedBridge {
    constructor();
    screenWidth(): void;
    screenHeight(): void;
    enabledPlugins(): void;
    hasAdaptiveThemes(): void;
    themeName(): void;
    breakpoint(): void;
    colorScheme(): void;
    contentSizeCategory(): void;
    sortedBreakpointPairs(): void;
    insets(): void;
    pixelRatio(): void;
    fontScale(): void;
    statusBar(): void;
    navigationBar(): void;
    themes(themes: Array<keyof UnistylesThemes>): void;
    useBreakpoints(breakpoints: UnistylesBreakpoints): void;
    useTheme(name: keyof UnistylesThemes): void;
    updateTheme(name: keyof UnistylesThemes): void;
    useAdaptiveThemes(enable: boolean): void;
    addPlugin(pluginName: string, notify: boolean): void;
    removePlugin(pluginName: string): void;
    setRootViewBackgroundColor(color?: string, alpha?: number): void;
    setImmersiveMode(isEnabled: boolean): void;
}
//# sourceMappingURL=UnistylesMockedBridge.d.ts.map