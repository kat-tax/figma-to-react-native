import type { HybridObject } from 'react-native-nitro-modules';
import type { UnistyleDependency } from '../NativePlatform';
export interface UnistylesStyleSheet extends HybridObject<{
    ios: 'c++';
    android: 'c++';
}> {
    readonly hairlineWidth: number;
    readonly unid: number;
    addChangeListener(onChanged: (dependencies: Array<UnistyleDependency>) => void): () => void;
}
//# sourceMappingURL=UnistylesStyleSheet.nitro.d.ts.map