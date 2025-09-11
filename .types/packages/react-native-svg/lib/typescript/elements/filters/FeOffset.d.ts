import React from 'react';
import { NumberProp } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
export interface FeOffsetProps {
    in?: string;
    dx?: NumberProp;
    dy?: NumberProp;
}
export default class FeOffset extends FilterPrimitive<FeOffsetProps> {
    static displayName: string;
    static defaultProps: React.ComponentProps<typeof FeOffset>;
    render(): React.JSX.Element;
}
//# sourceMappingURL=FeOffset.d.ts.map