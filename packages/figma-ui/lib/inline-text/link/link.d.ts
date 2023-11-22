import type { ComponentChildren } from 'preact';
import type { FocusableComponentProps } from '../../types/focusable-component-props';
export interface LinkProps extends FocusableComponentProps<HTMLAnchorElement> {
    children: ComponentChildren;
    href: string;
    target?: string;
    fullWidth?: boolean;
}
export declare const Link: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component").MixinHTMLElementAttributes<HTMLAnchorElement, LinkProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLAnchorElement> | undefined;
}>;
//# sourceMappingURL=link.d.ts.map