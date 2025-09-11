import type { HybridObject } from 'react-native-nitro-modules';
export interface UnistylesStatusBar extends HybridObject<{
    ios: 'c++';
    android: 'c++';
}> {
    readonly width: number;
    readonly height: number;
    setHidden(isHidden: boolean): void;
}
//# sourceMappingURL=UnistylesStatusBar.nitro.d.ts.map