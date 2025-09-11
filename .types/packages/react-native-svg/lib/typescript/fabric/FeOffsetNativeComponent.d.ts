import type { ViewProps } from './utils';
import { NumberProp } from '../lib/extract/types';
import type { UnsafeMixed } from './codegenUtils';
interface FilterPrimitiveCommonProps {
    x?: UnsafeMixed<NumberProp>;
    y?: UnsafeMixed<NumberProp>;
    width?: UnsafeMixed<NumberProp>;
    height?: UnsafeMixed<NumberProp>;
    result?: string;
}
export interface NativeProps extends ViewProps, FilterPrimitiveCommonProps {
    in1?: string;
    dx?: UnsafeMixed<NumberProp>;
    dy?: UnsafeMixed<NumberProp>;
}
declare const _default: import("react-native/Libraries/Utilities/codegenNativeComponent").NativeComponentType<NativeProps>;
export default _default;
//# sourceMappingURL=FeOffsetNativeComponent.d.ts.map