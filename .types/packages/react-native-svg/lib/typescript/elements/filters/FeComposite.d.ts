import React from 'react';
import { NumberProp } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
type FeCompositeOperator = 'over' | 'in' | 'out' | 'atop' | 'xor' | 'arithmetic';
export interface FeCompositeProps {
    in?: string;
    in2?: string;
    operator?: FeCompositeOperator;
    k1?: NumberProp;
    k2?: NumberProp;
    k3?: NumberProp;
    k4?: NumberProp;
}
export default class FeComposite extends FilterPrimitive<FeCompositeProps> {
    static displayName: string;
    static defaultProps: {
        k1: number;
        k2: number;
        k3: number;
        k4: number;
        x?: NumberProp;
        y?: NumberProp;
        width?: NumberProp;
        height?: NumberProp;
        result?: string;
    };
    render(): React.JSX.Element;
}
export {};
//# sourceMappingURL=FeComposite.d.ts.map