import type { BoxShadowValue } from 'react-native';
import type { TransformStyles } from '../../types/core';
import { type AllShadow, type AllShadowKeys, type Filters } from './types';
export declare const isTransform: (key: string, value: any) => value is Array<TransformStyles>;
export declare const isTextShadow: (key: string) => boolean;
export declare const isShadow: (key: string) => boolean;
export declare const isFilter: (key: string, value: any) => value is Array<Filters>;
export declare const isBoxShadow: (key: string, value: any) => value is Array<BoxShadowValue>;
export declare const normalizeNumericValue: (value: number | string) => string | number;
export declare const normalizeColor: (color: string, opacity?: number) => string;
export declare const extractShadowValue: <TKey extends AllShadowKeys>(key: TKey, breakpoint: string, styles: any) => AllShadow[TKey];
//# sourceMappingURL=utils.d.ts.map