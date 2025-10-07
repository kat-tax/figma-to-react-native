import type { Float, Int32, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps } from './utils';
interface SvgNodeCommonProps {
    name?: string;
    opacity?: WithDefault<Float, 1.0>;
    matrix?: ReadonlyArray<Float>;
    mask?: string;
    markerStart?: string;
    markerMid?: string;
    markerEnd?: string;
    clipPath?: string;
    clipRule?: WithDefault<Int32, 0>;
    responsible?: boolean;
    display?: string;
    pointerEvents?: string;
}
interface NativeProps extends ViewProps, SvgNodeCommonProps {
}
declare const _default: import("react-native/Libraries/Utilities/codegenNativeComponent").NativeComponentType<NativeProps>;
export default _default;
//# sourceMappingURL=DefsNativeComponent.d.ts.map