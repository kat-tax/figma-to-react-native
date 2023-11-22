import { ComponentChildren } from 'preact';
export type BannerProps = {
    children: ComponentChildren;
    icon: ComponentChildren;
    variant?: BannerVariant;
};
export type BannerVariant = 'success' | 'warning';
export declare const Banner: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLDivElement, BannerProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLDivElement> | undefined;
}>;
//# sourceMappingURL=banner.d.ts.map