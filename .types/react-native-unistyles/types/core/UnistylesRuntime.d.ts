import type { Color, UnistylesBridge, UnistylesPlugin } from '../types';
import type { UnistylesThemes } from '../global';
import type { UnistyleRegistry } from './UnistyleRegistry';
/**
 * Utility to interact with the Unistyles during runtime
 */
export declare class UnistylesRuntime {
    private unistylesBridge;
    private unistylesRegistry;
    constructor(unistylesBridge: UnistylesBridge, unistylesRegistry: UnistyleRegistry);
    /**
     * Get the mini runtime injected to creteStyleSheet
     * @returns - The mini runtime
     */
    get miniRuntime(): {
        contentSizeCategory: import("..").IOSContentSizeCategory | import("..").AndroidContentSizeCategory;
        breakpoint: keyof import("..").UnistylesBreakpoints;
        screen: {
            width: number;
            height: number;
        };
        insets: import("../types").ScreenInsets;
        statusBar: {
            width: number;
            height: number;
        };
        navigationBar: {
            width: number;
            height: number;
        };
        orientation: "landscape" | "portrait";
        pixelRatio: number;
        fontScale: number;
        hairlineWidth: number;
        rtl: boolean;
    };
    /**
     * Get the current color scheme
     * @returns - The current color scheme
     */
    get colorScheme(): import("../types").ColorSchemeName;
    /**
     * Get the layout direction
     * @returns - Boolean indicating if the layout direction is RTL
     */
    get rtl(): boolean;
    /**
     * Get info about adaptive themes
     * @returns - boolean indicating if the adaptive themes are enabled
     */
    get hasAdaptiveThemes(): boolean;
    /**
     * Get the current theme name
     * @returns - The current theme name
     */
    get themeName(): never;
    /**
     * Get the current content size category
     * @returns - The current content size category
     */
    get contentSizeCategory(): import("..").IOSContentSizeCategory | import("..").AndroidContentSizeCategory;
    /**
     * Get the current breakpoint based on device size
     * @returns - The current breakpoint
     */
    get breakpoint(): keyof import("..").UnistylesBreakpoints;
    /**
     * Get registered breakpoints with UnitylesRegistry
     * @returns - The registered breakpoints
     */
    get breakpoints(): import("..").UnistylesBreakpoints;
    /**
     * Get the names of currently enabled plugins
     * @deprecated - Plugins will be removed in the next major release
     * @returns - The names of currently enabled plugins
     */
    get enabledPlugins(): string[];
    /**
     * Get the screen size
     * @returns - The screen size { width, height }
     */
    get screen(): {
        width: number;
        height: number;
    };
    /**
     * Get the safe area insets
     * @returns - The safe area insets { top, bottom, left, right }
     */
    get insets(): import("../types").ScreenInsets;
    /**
     * Get the status bar info
     * @returns - The status bar api { width, height, setColor, setHidden }
     */
    get statusBar(): {
        width: number;
        height: number;
        setColor: (color?: Color, alpha?: number) => void;
        setHidden: (hidden: boolean) => void;
    };
    /**
     * Get the navigation bar info (Android)
     * @returns - The navigation bar api { width, height, setColor, setHidden }
     */
    get navigationBar(): {
        width: number;
        height: number;
        setColor: (color?: Color, alpha?: number) => void;
        setHidden: (hidden: boolean) => void;
    };
    /**
     * Get the screen orientation
     * @returns - The screen orientation
     */
    get orientation(): "landscape" | "portrait";
    /**
     * Get the pixel ratio
     * @returns - The pixel ratio
     */
    get pixelRatio(): number;
    /**
     * Get the font scale
     * @returns - The font scale
     */
    get fontScale(): number;
    /**
     * Get the hairline width
     * @returns - The thinnest width of the platform
     */
    get hairlineWidth(): number;
    /**
     * Get theme by name
     * @param themeName - The name of the theme to get or current theme if not specified
     * @returns - The theme
     */
    getTheme(themeName?: keyof UnistylesThemes): never;
    /**
     * Get the immersive mode (both status bar and navigation bar hidden (Android))
     * @param isEnabled
     */
    setImmersiveMode(isEnabled: boolean): void;
    /**
     * Set the root view background color
     * @param color - The color to set
     * @param alpha - Color alpha - default is 1
     */
    setRootViewBackgroundColor: (color?: Color, alpha?: number) => void;
    /**
     * Switch to a different theme
     * @param name - The name of the theme to switch to
     * @returns - boolean indicating if the theme was switched
     */
    setTheme: (name: keyof UnistylesThemes) => true | undefined;
    /**
     * Update the theme at runtime
     * If current theme is updated, the changes will be applied immediately
     * @param name - The name of the theme to update
     * @param updater - Function that receives the current theme and expect modified theme to be returned
     */
    updateTheme: (name: keyof UnistylesThemes, updater: (theme: UnistylesThemes[keyof UnistylesThemes]) => UnistylesThemes[keyof UnistylesThemes]) => void;
    /**
     * Enable or disable adaptive themes
     * @param enable - boolean indicating if adaptive themes should be enabled
     */
    setAdaptiveThemes: (enable: boolean) => void;
    /**
     * Enable a plugin
     * @deprecated - Plugins will be removed in the next major release
     * @param plugin - Plugin that conforms to UnistylesPlugin interface
     */
    addPlugin: (plugin: UnistylesPlugin) => void;
    /**
     * Disable a plugin
     * @deprecated - Plugins will be removed in the next major release
     * @param plugin - Plugin that conforms to UnistylesPlugin interface
     */
    removePlugin: (plugin: UnistylesPlugin) => void;
}
//# sourceMappingURL=UnistylesRuntime.d.ts.map