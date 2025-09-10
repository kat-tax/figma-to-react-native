import { PressableStateCallbackType } from 'react-native';
type VStyleSheet<S> = {
    [K in keyof S]: VStyleVar<S[K]>;
};
type VStyleVar<S> = (e?: PressableStateCallbackType) => S[];
export type { VStyleSheet };
export declare function useVariants<S>(variants: Record<string, readonly string[]>, states?: Record<string, string>, styles?: S): {
    vstyles: VStyleSheet<S>;
};
