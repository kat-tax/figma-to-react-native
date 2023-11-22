import { ComponentChildren } from 'preact';
export type TextProps = {
    align?: TextAlignment;
    children: ComponentChildren;
    numeric?: boolean;
};
export type TextAlignment = 'left' | 'center' | 'right';
export declare const Text: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLDivElement, TextProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLDivElement> | undefined;
}>;
//# sourceMappingURL=text.d.ts.map