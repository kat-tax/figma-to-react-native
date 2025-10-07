import { NumberProp } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
import { ChannelSelector } from './types';
export interface FeDisplacementMapProps {
    in?: string;
    in2?: string;
    scale?: NumberProp;
    xChannelSelector?: ChannelSelector;
    yChannelSelector?: ChannelSelector;
}
export default class FeDisplacementMap extends FilterPrimitive<FeDisplacementMapProps> {
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
//# sourceMappingURL=FeDisplacementMap.d.ts.map