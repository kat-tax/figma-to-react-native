import React from 'react';
import { FilterColorMatrixType, NumberArray } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
export type FeColorMatrixProps = {
    in?: string;
    type?: FilterColorMatrixType;
    values?: NumberArray;
};
export default class FeColorMatrix extends FilterPrimitive<FeColorMatrixProps> {
    static displayName: string;
    static defaultProps: React.ComponentProps<typeof FeColorMatrix>;
    render(): React.JSX.Element;
}
//# sourceMappingURL=FeColorMatrix.d.ts.map