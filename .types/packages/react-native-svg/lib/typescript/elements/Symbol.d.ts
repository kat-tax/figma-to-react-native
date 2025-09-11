import type { ReactNode } from 'react';
import * as React from 'react';
import Shape from './Shape';
import type { NumberProp } from '../lib/extract/types';
export interface SymbolProps {
    children?: ReactNode;
    id?: string;
    viewBox?: string;
    preserveAspectRatio?: string;
    opacity?: NumberProp;
}
export default class Symbol extends Shape<SymbolProps> {
    static displayName: string;
    render(): React.JSX.Element;
}
//# sourceMappingURL=Symbol.d.ts.map