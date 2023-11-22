import type { ComponentChildren } from 'preact';
import type { Space } from '../../types/space';
export type ContainerProps = {
    children: ComponentChildren;
    space: ContainerSpace;
};
export type ContainerSpace = Space;
export declare const Container: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component").MixinHTMLElementAttributes<HTMLDivElement, ContainerProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLDivElement> | undefined;
}>;
//# sourceMappingURL=container.d.ts.map