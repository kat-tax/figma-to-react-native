import { NumberArray, NumberProp } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
export interface FeTurbulenceProps {
    baseFrequency?: NumberArray;
    numOctaves?: NumberProp;
    seed?: NumberProp;
    stitchTiles?: 'stitch' | 'noStitch';
    type?: 'fractalNoise' | 'turbulence';
}
export default class FeTurbulence extends FilterPrimitive<FeTurbulenceProps> {
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
//# sourceMappingURL=FeTurbulence.d.ts.map