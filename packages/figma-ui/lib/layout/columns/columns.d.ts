import type { ComponentChild } from 'preact';
import type { Space } from '../../types/space';
export type ColumnsProps = {
    children: ComponentChild;
    space?: ColumnsSpace;
};
export type ColumnsSpace = Space;
export declare const Columns: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component").MixinHTMLElementAttributes<HTMLDivElement, ColumnsProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLDivElement> | undefined;
}>;
//# sourceMappingURL=columns.d.ts.map