import { StyleProp, ViewStyle } from 'react-native';
export type SliderComponent = (props: SliderProps) => JSX.Element;
export interface SliderProps {
    /** Called when the slider value changes */
    onChange?: (value: number) => void;
    /** The value of the slider (controlled) */
    value?: number;
    /** The value of the slider (uncontrolled) */
    defaultValue?: number;
    /** The lower limit value of the slider. The user won't be able to slide below this limit. Default value is 0. */
    lowerLimit?: number;
    /** The upper limit value of the slider. The user won't be able to slide above this limit. Default value is 100. */
    upperLimit?: number;
    /** Step value of the slider. The value should be between 0 and (maximumValue - minimumValue). Default value is 1. */
    step?: number;
    /** If true the user won't be able to move the slider. Default = false. */
    disabled?: boolean;
    /** The track height */
    trackHeight?: number;
    /** The background track color */
    trackColor?: string;
    /** The color used for the track from minimum value to current value */
    rangeColor?: string;
    /** The thumb accent color */
    thumbColor?: string;
    /** Used to style and layout the slider. */
    style?: StyleProp<ViewStyle>;
    /** Form input name (web only) */
    name?: string;
    /** The identifier used for testing */
    testID?: string;
}
