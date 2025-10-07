import type React from 'react';
import type { Nullable, UnistylesValues } from '../../types';
type Styles = readonly [
    {
        hash: string;
    },
    Array<UnistylesValues>
];
export declare const createUnistylesRef: <T>(styles?: Styles, forwardedRef?: React.ForwardedRef<T>) => ((ref: Nullable<T>) => void) | undefined;
export {};
//# sourceMappingURL=createUnistylesRef.d.ts.map