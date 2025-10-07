import React from 'react';
import FilterPrimitive from './FilterPrimitive';
type BlendMode = 'normal' | 'multiply' | 'screen' | 'darken' | 'lighten';
export interface FeBlendProps {
    in?: string;
    in2?: string;
    mode?: BlendMode;
}
export default class FeBlend extends FilterPrimitive<FeBlendProps> {
    static displayName: string;
    static defaultProps: {
        mode: string;
        x?: import("../..").NumberProp;
        y?: import("../..").NumberProp;
        width?: import("../..").NumberProp;
        height?: import("../..").NumberProp;
        result?: string;
    };
    render(): React.JSX.Element;
}
export {};
//# sourceMappingURL=FeBlend.d.ts.map