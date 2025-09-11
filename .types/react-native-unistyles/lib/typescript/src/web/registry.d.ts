import type { UnistyleDependency, UnistylesMiniRuntime } from '../specs';
import type { UnistylesTheme, UnistylesValues } from '../types';
import type { StyleSheet, StyleSheetWithSuperPowers } from '../types/stylesheet';
import { CSSState } from './css';
import type { UnistylesServices } from './types';
export declare class UnistylesRegistry {
    private services;
    private readonly stylesheets;
    private readonly stylesCache;
    private readonly stylesCounter;
    private readonly disposeListenersMap;
    private readonly dependenciesMap;
    readonly css: CSSState;
    constructor(services: UnistylesServices);
    getComputedStylesheet: (stylesheet: StyleSheetWithSuperPowers<StyleSheet>, scopedThemeName?: UnistylesTheme) => StyleSheet;
    addDependenciesToStylesheet: (stylesheet: (theme: UnistylesTheme, miniRuntime: UnistylesMiniRuntime) => StyleSheet, dependencies: Array<UnistyleDependency>) => void;
    connect: (ref: HTMLElement, hash: string) => void;
    remove: (ref: HTMLElement, hash: string) => Promise<boolean>;
    add: (value: UnistylesValues, forChild?: boolean) => {
        hash: string;
        existingHash: boolean;
    };
    applyStyles: (hash: string, value: UnistylesValues) => void;
    reset: () => void;
}
//# sourceMappingURL=registry.d.ts.map