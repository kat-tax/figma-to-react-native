export type RadioGroupComponent = (props: RadioGroupProps) => JSX.Element;
export interface RadioGroupProps {
    /** The initial value of the selected radio button */
    initialValue?: string;
    /** Invoked when selecting one of the radio buttons in the group */
    onValueChange?: (value?: string) => void;
    /** The accessibility label for the group */
    label?: string;
    /** * The radio group buttons */
    children?: React.ReactNode;
    /** The identifier used for testing */
    testID?: string;
}
