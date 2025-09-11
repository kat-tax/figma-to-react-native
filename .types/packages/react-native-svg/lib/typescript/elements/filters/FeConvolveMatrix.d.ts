import { BooleanProp, NumberArray, NumberProp } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
import { EdgeMode } from './types';
export interface FeConvolveMatrixProps {
    in?: string;
    order?: NumberArray;
    kernelMatrix?: NumberArray;
    divisor?: NumberProp;
    bias?: NumberProp;
    targetX?: NumberProp;
    targetY?: NumberProp;
    edgeMode?: EdgeMode;
    kernelUnitLength?: NumberArray;
    preserveAlpha?: BooleanProp;
}
export default class FeConvolveMatrix extends FilterPrimitive<FeConvolveMatrixProps> {
    static displayName: string;
    static defaultProps: {
        x?: NumberProp;
        y?: NumberProp;
        width?: NumberProp;
        height?: NumberProp;
        result?: string;
    };
    render(): null;
}
//# sourceMappingURL=FeConvolveMatrix.d.ts.map