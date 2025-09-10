import type { Color, UnistylesBridge, UnistylesPlugin } from '../../types';
import type { UnistylesThemes } from '../../global';
import type { UnistyleRegistry } from '../UnistyleRegistry';
export declare class UnistylesMockedRuntime {
    private unistylesBridge;
    private unistylesRegistry;
    private unistylesRegistry;
    constructor(unistylesBridge: UnistylesBridge, unistylesRegistry: UnistyleRegistry);
    get miniRuntime(): {
        contentSizeCategory: string;
        breakpoint: number | keyof import("../..").UnistylesBreakpoints | undefined;
        screen: {
            width: number;
            height: number;
        };
        insets: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
        statusBar: {
            width: number;
            height: number;
        };
        navigationBar: {
            width: number;
            height: number;
        };
        orientation: "portrait";
        pixelRatio: number;
        fontScale: number;
        hairlineWidth: number;
        rtl: boolean;
    };
    get colorScheme(): string;
    get hasAdaptiveThemes(): boolean;
    get themeName(): undefined;
    get contentSizeCategory(): string;
    get breakpoint(): number | keyof import("../..").UnistylesBreakpoints | undefined;
    get rtl(): boolean;
    get breakpoints(): import("../..").UnistylesBreakpoints;
    get enabledPlugins(): UnistylesPlugin[];
    get screen(): {
        width: number;
        height: number;
    };
    get insets(): {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    get pixelRatio(): number;
    get hairlineWidth(): number;
    get fontScale(): number;
    get statusBar(): {
        height: number;
        width: number;
        setColor: () => void;
        setHidden: () => void;
    };
    get navigationBar(): {
        height: number;
        width: number;
        setColor: () => void;
        setHidden: () => void;
    };
    get orientation(): "portrait";
    getTheme: (themeName?: keyof UnistylesThemes) => never;
    setTheme: (name: keyof UnistylesThemes) => boolean;
    updateTheme: (name: keyof UnistylesThemes, theme: UnistylesThemes[keyof UnistylesThemes]) => void;
    setAdaptiveThemes: (enabled: boolean) => void;
    addPlugin: (plugin: UnistylesPlugin) => void;
    removePlugin: (plugin: UnistylesPlugin) => void;
    setRootViewBackgroundColor: (color?: Color | string) => void;
    setImmersiveMode: (isEnabled: boolean) => void;
}
//# sourceMappingURL=UnistylesMockedRuntime.d.ts.map