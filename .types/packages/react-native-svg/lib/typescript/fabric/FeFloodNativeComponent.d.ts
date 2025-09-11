import type { ColorValue } from 'react-native';
import type { Float, Int32, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import type { NumberProp } from '../lib/extract/types';
import type { UnsafeMixed } from './codegenUtils';
import type { ViewProps } from './utils';
interface FilterPrimitiveCommonProps {
    x?: UnsafeMixed<NumberProp>;
    y?: UnsafeMixed<NumberProp>;
    width?: UnsafeMixed<NumberProp>;
    height?: UnsafeMixed<NumberProp>;
    result?: string;
}
type ColorStruct = Readonly<{
    type?: WithDefault<Int32, -1>;
    payload?: ColorValue;
    brushRef?: string;
}>;
export interface NativeProps extends ViewProps, FilterPrimitiveCommonProps {
    floodColor?: UnsafeMixed<ColorValue | ColorStruct>;
    floodOpacity?: WithDefault<Float, 1.0>;
}
declare const _default: import("react-native/Libraries/Utilities/codegenNativeComponent").NativeComponentType<NativeProps>;
export default _default;
//# sourceMappingURL=FeFloodNativeComponent.d.ts.map