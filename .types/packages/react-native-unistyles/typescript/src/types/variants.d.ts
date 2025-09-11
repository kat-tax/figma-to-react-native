import type { SafeReturnType } from './common';
export type ExtractVariantNames<T> = ExtractVariantKeys<SafeReturnType<T>>;
type ExtractVariantKeys<T> = T extends object ? ExtractVariant<SafeReturnType<T[keyof T]>> : never;
type HasBooleanVariants<T> = T extends Record<'true', any> ? true : T extends Record<'false', any> ? true : false;
type ExtractSubVariantKeys<T> = T extends object ? HasBooleanVariants<T> extends true ? keyof Omit<T, 'default'> | boolean | undefined : keyof Omit<T, 'default'> | undefined : never;
type ExtractVariant<T> = T extends {
    variants: infer V;
} ? {
    [key in keyof V]?: ExtractSubVariantKeys<V[key]>;
} : never;
export type UnistylesVariants<ST> = ST extends {
    useVariants: infer V;
} ? V extends (variants: infer T) => void ? T : never : never;
export {};
//# sourceMappingURL=variants.d.ts.map