import { ComponentChildren } from 'preact';
import { Space } from '../../types/space.js';
export type StackProps = {
    children: ComponentChildren;
    space: StackSpace;
};
export type StackSpace = Space;
export declare const Stack: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLDivElement, StackProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLDivElement> | undefined;
}>;
//# sourceMappingURL=stack.d.ts.map