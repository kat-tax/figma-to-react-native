import { ComponentChildren } from 'preact';
import { EventHandler } from '../../types/event-handler.js';
export interface DropdownProps {
    disabled?: boolean;
    icon?: ComponentChildren;
    onChange?: EventHandler.onChange<HTMLInputElement>;
    onKeyDown?: EventHandler.onKeyDown<HTMLDivElement>;
    onMouseDown?: EventHandler.onMouseDown<HTMLDivElement>;
    onValueChange?: EventHandler.onValueChange<string>;
    options: Array<DropdownOption>;
    placeholder?: string;
    propagateEscapeKeyDown?: boolean;
    value: null | string;
    variant?: DropdownVariant;
}
export type DropdownOption = DropdownOptionHeader | DropdownOptionSeparator | DropdownOptionValue;
export type DropdownOptionHeader = {
    header: string;
};
export type DropdownOptionSeparator = '-';
export type DropdownOptionValue = {
    disabled?: boolean;
    text?: string;
    value: string;
};
export type DropdownVariant = 'border' | 'underline';
export declare const Dropdown: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLDivElement, DropdownProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLDivElement> | undefined;
}>;
//# sourceMappingURL=dropdown.d.ts.map