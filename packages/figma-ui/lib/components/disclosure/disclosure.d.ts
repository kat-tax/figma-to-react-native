import { ComponentChildren } from 'preact';
import { EventHandler } from '../../types/event-handler.js';
import { FocusableComponentProps } from '../../types/focusable-component-props.js';
export interface DisclosureProps extends FocusableComponentProps<HTMLInputElement> {
    children: ComponentChildren;
    onClick?: EventHandler.onClick<HTMLInputElement>;
    open: boolean;
    title: string;
}
export declare const Disclosure: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLInputElement, DisclosureProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLInputElement> | undefined;
}>;
//# sourceMappingURL=disclosure.d.ts.map