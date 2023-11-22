import { ComponentChildren } from 'preact';
import { RawTextboxNumericProps } from './private/raw-textbox-numeric.js';
export type TextboxNumericProps = RawTextboxNumericProps & {
    icon?: ComponentChildren;
    variant?: TextboxNumericVariant;
};
export type TextboxNumericVariant = 'border' | 'underline';
export declare const TextboxNumeric: import("preact").FunctionalComponent<Omit<import("../../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLInputElement, TextboxNumericProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLInputElement> | undefined;
}>;
//# sourceMappingURL=textbox-numeric.d.ts.map