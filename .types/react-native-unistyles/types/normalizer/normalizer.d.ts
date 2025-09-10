import type { TextShadow, Transforms, BoxShadow } from '../types';
type Preprocessor = {
    createTextShadowValue(style: TextShadow): string;
    createBoxShadowValue(style: Required<BoxShadow>): string;
    createTransformValue(transforms: Required<Transforms>): string;
};
export declare const normalizeColor: (color: string, opacity?: number) => string;
export declare const normalizeNumericValue: (value: number) => string | number;
export declare const preprocessor: Preprocessor;
export {};
//# sourceMappingURL=normalizer.d.ts.map