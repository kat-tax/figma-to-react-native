import { ComponentChildren } from 'preact';
import { EventHandler } from '../../types/event-handler.js';
import { FocusableComponentProps } from '../../types/focusable-component-props.js';
export interface ButtonProps extends FocusableComponentProps<HTMLButtonElement> {
    children: ComponentChildren;
    danger?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    loading?: boolean;
    onClick?: EventHandler.onClick<HTMLButtonElement>;
    secondary?: boolean;
}
export declare const Button: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLButtonElement, ButtonProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLButtonElement> | undefined;
}>;
//# sourceMappingURL=button.d.ts.map