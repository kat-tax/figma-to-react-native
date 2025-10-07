import { StyleProp, ViewStyle, ColorValue } from 'react-native';
export type SwitchComponent = (props: SwitchProps) => JSX.Element;
export interface SwitchProps {
    /** Invoked with the new value when the value changes */
    onValueChange?: (value: boolean) => void;
    /** The value of the switch */
    value?: boolean;
    /** The identifier for the switch */
    id?: string;
    /** Form input name (web only) */
    name?: string;
    /** Whether the switch selection is required (web only) */
    required?: boolean;
    /** Whether the switch should be disabled */
    disabled?: boolean;
    /** The switch background color when it's turned on */
    onColor?: ColorValue;
    /** The switch background color when it's turned off */
    offColor?: ColorValue;
    /** The switch background color when it's disabled */
    disabledColor?: ColorValue;
    /** The switch's thumb color */
    thumbColor?: ColorValue;
    /** Additional styling */
    style?: StyleProp<ViewStyle>;
    /** The identifier used for testing */
    testID?: string;
}
