import { NumberArray, NumberProp } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
export interface FeSpecularLightingProps {
    in?: string;
    surfaceScale?: NumberProp;
    specularConstant?: NumberProp;
    specularExponent?: NumberProp;
    kernelUnitLength?: NumberArray;
}
export default class FeSpecularLighting extends FilterPrimitive<FeSpecularLightingProps> {
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
//# sourceMappingURL=FeSpecularLighting.d.ts.map