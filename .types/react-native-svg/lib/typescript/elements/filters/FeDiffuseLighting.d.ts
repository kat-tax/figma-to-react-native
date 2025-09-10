import { NumberArray, NumberProp } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
export interface FeDiffuseLightingProps {
    in?: string;
    surfaceScale?: NumberProp;
    diffuseConstant?: NumberProp;
    kernelUnitLength?: NumberArray;
}
export default class FeDiffuseLighting extends FilterPrimitive<FeDiffuseLightingProps> {
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
//# sourceMappingURL=FeDiffuseLighting.d.ts.map