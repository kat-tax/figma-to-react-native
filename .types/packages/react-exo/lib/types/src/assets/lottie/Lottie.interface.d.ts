import { ViewStyle, DimensionValue } from 'react-native';
export type LottieComponent = (props: LottieProps) => JSX.Element;
export interface LottieProps {
    /** Source of the animation, it can be a JSON file or a DotLottie file. */
    url: string;
    /** Width of the animation. */
    width?: DimensionValue;
    /** Height of the animation. */
    height?: DimensionValue;
    /** Style of the animation. */
    style?: ViewStyle;
    /** Resize mode of the animation. */
    resizeMode?: 'cover' | 'contain' | 'stretch';
    /** If true, the animation will start playing as soon as it is ready. */
    autoplay?: boolean;
    /** If true, the animation will loop. */
    loop?: boolean;
    /** A value that controls the speed of the animation. */
    speed?: number;
    /** The identifier used for testing */
    testID?: string;
}
