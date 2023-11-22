import { ComponentChildren } from 'preact';
import { EventHandler } from '../../types/event-handler.js';
import { FocusableComponentProps } from '../../types/focusable-component-props.js';
export interface SegmentedControlProps extends FocusableComponentProps<HTMLInputElement> {
    disabled?: boolean;
    onChange?: EventHandler.onChange<HTMLInputElement>;
    onValueChange?: EventHandler.onValueChange<string>;
    options: Array<SegmentedControlOption>;
    value: string;
}
export type SegmentedControlOption = {
    disabled?: boolean;
    children?: ComponentChildren;
    value: string;
};
export declare const SegmentedControl: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLInputElement, SegmentedControlProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLInputElement> | undefined;
}>;
//# sourceMappingURL=segmented-control.d.ts.map