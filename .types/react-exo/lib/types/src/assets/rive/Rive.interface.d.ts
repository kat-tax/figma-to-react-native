import { DimensionValue, ViewStyle } from 'react-native';
import { Alignment, RiveRef } from 'rive-react-native';
export type RiveComponent = (props: RiveProps) => React.ReactNode;
export interface RiveProps {
    /** Source of the animation. */
    url: string;
    /** Reference to the Rive runtime */
    ref?: React.Ref<RiveRef>;
    /** Width of the animation. */
    width?: DimensionValue;
    /** Height of the animation. */
    height?: DimensionValue;
    /** Style of the animation. */
    style?: ViewStyle;
    /** Resize mode of the animation. */
    resizeMode?: 'cover' | 'contain' | 'fill' | 'fitWidth' | 'fitHeight' | 'none' | 'scaleDown';
    /** If true, the animation will start playing as soon as it is ready. */
    autoplay?: boolean;
    /** If true, the animation will loop. */
    loop?: boolean;
    /** Alignment of the animation. */
    alignment?: Alignment;
    /** Name of the artboard to play. */
    artboardName?: string | undefined;
    /** Name of the animation to play. */
    animationName?: string | undefined;
    /** Name of the state machine to play. */
    stateMachineName?: string | undefined;
    /** The identifier used for testing */
    testID?: string;
}
export type { RiveRef };
