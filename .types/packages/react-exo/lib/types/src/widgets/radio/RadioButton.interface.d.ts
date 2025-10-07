export type RadioButtonComponent = (props: RadioButtonProps) => JSX.Element;
export interface RadioButtonProps {
    /** The radio button's form id */
    id?: string;
    /** The initial value of the selected radio button */
    value: string;
    /** The label text to display by the radio item */
    label?: string;
    /** Whether the radio button is disabled */
    disabled?: boolean;
    /** The identifier used for testing */
    testID?: string;
}
