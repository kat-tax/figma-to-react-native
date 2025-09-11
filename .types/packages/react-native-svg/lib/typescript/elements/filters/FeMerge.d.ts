import React from 'react';
import FilterPrimitive from './FilterPrimitive';
export interface FeMergeProps {
    children?: React.ReactElement | Array<React.ReactElement>;
}
export default class FeMerge extends FilterPrimitive<FeMergeProps> {
    static displayName: string;
    static defaultProps: {
        x?: import("../..").NumberProp;
        y?: import("../..").NumberProp;
        width?: import("../..").NumberProp;
        height?: import("../..").NumberProp;
        result?: string;
    };
    render(): React.JSX.Element;
}
//# sourceMappingURL=FeMerge.d.ts.map