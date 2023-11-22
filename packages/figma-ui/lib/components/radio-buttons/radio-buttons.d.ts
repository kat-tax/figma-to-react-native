import { ComponentChildren } from 'preact';
import { StackSpace } from '../../layout/stack/stack.js';
import { EventHandler } from '../../types/event-handler.js';
import { FocusableComponentProps } from '../../types/focusable-component-props.js';
export interface RadioButtonsProps extends FocusableComponentProps<HTMLDivElement> {
    disabled?: boolean;
    onChange?: EventHandler.onChange<HTMLInputElement>;
    onValueChange?: EventHandler.onValueChange<string>;
    options: Array<RadioButtonsOption>;
    space?: StackSpace;
    value: null | string;
}
export type RadioButtonsOption = {
    disabled?: boolean;
    children?: ComponentChildren;
    value: string;
};
export declare const RadioButtons: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLDivElement, RadioButtonsProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLDivElement> | undefined;
}>;
//# sourceMappingURL=radio-buttons.d.ts.map