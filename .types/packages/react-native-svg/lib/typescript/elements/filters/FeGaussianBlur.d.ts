import React from 'react';
import { FilterEdgeMode, NumberArray } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
export interface FeGaussianBlurProps {
    in?: string;
    stdDeviation?: NumberArray;
    edgeMode?: FilterEdgeMode;
}
export default class FeGaussianBlur extends FilterPrimitive<FeGaussianBlurProps> {
    static displayName: string;
    static defaultProps: React.ComponentProps<typeof FeGaussianBlur>;
    render(): React.JSX.Element;
}
//# sourceMappingURL=FeGaussianBlur.d.ts.map