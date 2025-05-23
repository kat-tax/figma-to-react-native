import {forwardRef} from 'react';
import type {ForwardedRef, ForwardRefExoticComponent, HTMLAttributes, PropsWithoutRef, ReactNode} from 'react';

type MixinHTMLElementAttributes<T extends EventTarget, P = Record<string, never>> = Omit<HTMLAttributes<T>, keyof P> & P;

export function createComponent<T extends EventTarget, P, Props = MixinHTMLElementAttributes<T, P>>(
  fn: (props: PropsWithoutRef<Props>, ref: ForwardedRef<T>) => ReactNode
): ForwardRefExoticComponent<PropsWithoutRef<Props>> {
  return forwardRef<T, Props>((props, ref) => fn(props, ref)) as any;
}
