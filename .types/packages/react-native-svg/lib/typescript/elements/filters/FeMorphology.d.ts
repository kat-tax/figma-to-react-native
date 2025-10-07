import { NumberArray } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
export interface FeMorphologyProps {
    in?: string;
    operator?: 'erode' | 'dilate';
    radius?: NumberArray;
}
export default class FeMorphology extends FilterPrimitive<FeMorphologyProps> {
    static displayName: string;
    static defaultProps: {
        x?: import("../../lib/extract/types").NumberProp;
        y?: import("../../lib/extract/types").NumberProp;
        width?: import("../../lib/extract/types").NumberProp;
        height?: import("../../lib/extract/types").NumberProp;
        result?: string;
    };
    render(): null;
}
//# sourceMappingURL=FeMorphology.d.ts.map