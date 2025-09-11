import { NumberProp } from '../lib/extract/types';
import type { UnsafeMixed } from './codegenUtils';
import type { ViewProps } from './utils';
import { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
type Units = 'userSpaceOnUse' | 'objectBoundingBox';
interface NativeProps extends ViewProps {
    name?: string;
    x?: UnsafeMixed<NumberProp>;
    y?: UnsafeMixed<NumberProp>;
    height?: UnsafeMixed<NumberProp>;
    width?: UnsafeMixed<NumberProp>;
    filterUnits?: WithDefault<Units, 'objectBoundingBox'>;
    primitiveUnits?: WithDefault<Units, 'userSpaceOnUse'>;
}
declare const _default: import("react-native/Libraries/Utilities/codegenNativeComponent").NativeComponentType<NativeProps>;
export default _default;
//# sourceMappingURL=FilterNativeComponent.d.ts.map