import { GestureResponderEvent, type ImageProps as RNImageProps } from 'react-native';
import { BaseProps } from '../types';
import { WebShape } from '../WebShape';
/**
 * `react-native-svg` supports additional props that aren't defined in the spec.
 * This function replaces them in a spec conforming manner.
 *
 * @param {WebShape} self Instance given to us.
 * @param {Object?} props Optional overridden props given to us.
 * @returns {Object} Cleaned props object.
 * @private
 */
export declare const prepare: <T extends BaseProps>(self: WebShape<T>, props?: Readonly<T>) => {
    onStartShouldSetResponder?: (e: GestureResponderEvent) => boolean;
    onResponderMove?: (e: GestureResponderEvent) => void;
    onResponderGrant?: (e: GestureResponderEvent) => void;
    onResponderRelease?: (e: GestureResponderEvent) => void;
    onResponderTerminate?: (e: GestureResponderEvent) => void;
    onResponderTerminationRequest?: (e: GestureResponderEvent) => boolean;
    onClick?: (e: GestureResponderEvent) => void;
    transform?: string;
    gradientTransform?: string;
    patternTransform?: string;
    'transform-origin'?: string;
    href?: RNImageProps["source"] | string | null;
    style?: object;
    ref?: unknown;
};
//# sourceMappingURL=prepare.d.ts.map