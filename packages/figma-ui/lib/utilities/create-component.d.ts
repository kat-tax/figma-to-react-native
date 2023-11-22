import type { FunctionalComponent, JSX, Ref, RenderableProps } from 'preact';
import type { ForwardFn } from 'preact/compat';
export type MixinHTMLElementAttributes<Target extends EventTarget, ComponentProps = Record<string, never>> = RenderableProps<Omit<JSX.HTMLAttributes<Target>, keyof ComponentProps> & ComponentProps>;
export declare function createComponent<Target extends EventTarget, ComponentProps, Props = MixinHTMLElementAttributes<Target, ComponentProps>>(fn: ForwardFn<Props, Target>): FunctionalComponent<Omit<Props, 'ref'> & {
    ref?: Ref<Target>;
}>;
//# sourceMappingURL=create-component.d.ts.map