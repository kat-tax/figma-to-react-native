import React from 'react';
import FilterPrimitive from './FilterPrimitive';
export interface FeComponentTransferProps {
    in?: string;
    children?: React.ReactElement | Array<React.ReactElement>;
}
export default class FeComponentTransfer extends FilterPrimitive<FeComponentTransferProps> {
    static displayName: string;
    static defaultProps: {
        x?: import("../..").NumberProp;
        y?: import("../..").NumberProp;
        width?: import("../..").NumberProp;
        height?: import("../..").NumberProp;
        result?: string;
    };
    render(): null;
}
//# sourceMappingURL=FeComponentTransfer.d.ts.map