import type { UnistylesThemes } from '../../global';
import type { AndroidContentSizeCategory, IOSContentSizeCategory, UnistylesTheme } from '../../types';
import type { UnistylesNavigationBar } from '../NavigtionBar';
import { type UnistylesStatusBar } from '../StatusBar';
import type { AppBreakpoint, AppTheme, AppThemeName, Color, ColorScheme, Orientation } from '../types';
import type { UnistylesMiniRuntime, UnistylesRuntime as UnistylesRuntimeSpec } from './UnistylesRuntime.nitro';
export interface UnistylesRuntimePrivate extends Omit<UnistylesRuntimeSpec, 'setRootViewBackgroundColor'> {
    readonly colorScheme: ColorScheme;
    readonly themeName?: AppThemeName;
    readonly contentSizeCategory: IOSContentSizeCategory | AndroidContentSizeCategory;
    readonly breakpoint?: AppBreakpoint;
    readonly orientation: Orientation;
    statusBar: UnistylesStatusBar;
    navigationBar: UnistylesNavigationBar;
    getTheme(themeName?: keyof UnistylesThemes): UnistylesTheme;
    setTheme(themeName: AppThemeName): void;
    updateTheme(themeName: AppThemeName, updater: (currentTheme: AppTheme) => AppTheme): void;
    setRootViewBackgroundColor(color?: string): void;
    nativeSetRootViewBackgroundColor(color?: Color): void;
    createHybridStatusBar(): UnistylesStatusBar;
    createHybridNavigationBar(): UnistylesNavigationBar;
}
type PrivateMethods = 'createHybridStatusBar' | 'createHybridNavigationBar' | 'dispose' | 'miniRuntime' | 'nativeSetRootViewBackgroundColor';
type UnistylesRuntime = Omit<UnistylesRuntimePrivate, PrivateMethods>;
export declare const Runtime: UnistylesRuntime;
export type { UnistylesMiniRuntime };
//# sourceMappingURL=index.d.ts.map