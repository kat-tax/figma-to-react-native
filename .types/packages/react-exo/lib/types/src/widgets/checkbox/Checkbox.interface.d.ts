import { StyleProp, ViewStyle, NativeMethods } from 'react-native';
export type CheckboxComponent = (props: CheckboxProps) => JSX.Element;
export interface CheckboxProps {
    /** Invoked with the new value when the value changes. */
    onValueChange?: (value: boolean) => void;
    /**
     * Write-only property representing the value of the checkbox.
     * Default value is false.
     *
     * This is not a controlled component, you don't need to update the value.
     */
    value?: boolean;
    /** Used to get the ref for the native checkbox */
    refNative?: React.Ref<NativeMethods>;
    /** Used to get the ref for the web checkbox */
    refWeb?: React.LegacyRef<HTMLButtonElement>;
    /** The identifier for the checkbox */
    id?: string;
    /** Form input name (web only) */
    name?: string;
    /** Whether the checkbox selection is required (web only) */
    required?: boolean;
    /** Whether the checkbox should be disabled */
    disabled?: boolean;
    /** The checkbox color */
    boxColor?: string;
    /** The checkbox color when selected */
    boxColorOn?: string;
    /** The selected indicator color */
    indicatorColor?: string;
    /** Additional styling */
    style?: StyleProp<ViewStyle>;
    /** The identifier used for testing */
    testID?: string;
}
