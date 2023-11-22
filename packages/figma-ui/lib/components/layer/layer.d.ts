import { ComponentChildren } from 'preact';
import { EventHandler } from '../../types/event-handler.js';
import { FocusableComponentProps } from '../../types/focusable-component-props.js';
export interface LayerProps extends FocusableComponentProps<HTMLInputElement> {
    bold?: boolean;
    children: ComponentChildren;
    component?: boolean;
    description?: string;
    icon: ComponentChildren;
    onChange?: EventHandler.onChange<HTMLInputElement>;
    onValueChange?: EventHandler.onValueChange<boolean>;
    value: boolean;
}
export declare const Layer: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLInputElement, LayerProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLInputElement> | undefined;
}>;
//# sourceMappingURL=layer.d.ts.map