import { ComponentChildren } from 'preact';
import { RawTextboxProps } from './private/raw-textbox.js';
export type TextboxProps = RawTextboxProps & {
    icon?: ComponentChildren;
    variant?: TextboxVariant;
};
export type TextboxVariant = 'border' | 'underline';
export declare const Textbox: import("preact").FunctionalComponent<Omit<import("../../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLInputElement, TextboxProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLInputElement> | undefined;
}>;
//# sourceMappingURL=textbox.d.ts.map