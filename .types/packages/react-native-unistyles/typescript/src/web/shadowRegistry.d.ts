import type { UnistylesTheme, UnistylesValues } from '../types';
import type { UniGeneratedStyle, UnistylesServices } from './types';
export declare class UnistylesShadowRegistry {
    private services;
    name: string;
    __type: string;
    equals: () => boolean;
    toString: () => string;
    dispose: () => void;
    private scopedTheme;
    private disposeMap;
    constructor(services: UnistylesServices);
    add: (ref: any, hash?: string) => void;
    addStyles: (unistyles: Array<UnistylesValues>, forChild?: boolean) => UniGeneratedStyle | {
        injectedClassName: string;
        hash: string;
        parsedStyles: UnistylesValues;
    };
    setScopedTheme: (theme?: UnistylesTheme) => void;
    getScopedTheme: () => undefined;
    remove: (ref: any, hash?: string) => void;
    flush: () => void;
}
//# sourceMappingURL=shadowRegistry.d.ts.map