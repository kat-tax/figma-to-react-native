import { ComponentChildren } from 'preact';
import { Space } from '../../types/space.js';
export type InlineProps = {
    children: ComponentChildren;
    space?: InlineSpace;
};
export type InlineSpace = Space;
export declare const Inline: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLDivElement, InlineProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLDivElement> | undefined;
}>;
//# sourceMappingURL=inline.d.ts.map