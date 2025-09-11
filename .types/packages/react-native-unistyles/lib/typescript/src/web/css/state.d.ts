import type { UnistylesValues } from '../../types';
import type { UnistylesServices } from '../types';
type MapType = Map<string, Map<string, Map<string, any>>>;
type SetProps = {
    mediaQuery?: string;
    className: string;
    isMq?: boolean;
    propertyKey: string;
    value: any;
};
type HydrateState = Array<[string, Array<[string, Array<[string, any]>]>]>;
export declare class CSSState {
    private services;
    mainMap: MapType;
    mqMap: MapType;
    private styleTag;
    private themesCSS;
    constructor(services: UnistylesServices);
    set: ({ className, propertyKey, value, mediaQuery, isMq }: SetProps) => void;
    add: (hash: string, values: UnistylesValues) => void;
    recreate: () => void;
    addTheme: (theme: string, values: Record<string, any>) => void;
    remove: (hash: string) => void;
    getStyles: () => string;
    getState: () => {
        mainState: HydrateState;
        mqState: HydrateState;
        config: import("../../specs/StyleSheet").UnistylesConfig;
    };
    hydrate: ({ mainState, mqState }: ReturnType<typeof this.getState>) => void;
    reset: () => void;
}
export {};
//# sourceMappingURL=state.d.ts.map