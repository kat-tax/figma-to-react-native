import React from 'react';
import FilterPrimitive from './FilterPrimitive';
export interface FeMergeNodeProps {
    in?: string;
    parent?: React.Component;
}
export default class FeMergeNode extends FilterPrimitive<FeMergeNodeProps> {
    static displayName: string;
    setNativeProps: () => void;
    render(): null;
}
//# sourceMappingURL=FeMergeNode.d.ts.map