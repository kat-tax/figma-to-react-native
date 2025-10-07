import type { ReactNode } from 'react';
import * as React from 'react';
import type { NumberProp } from '../lib/extract/types';
import G from './G';
export interface ForeignObjectProps {
    children?: ReactNode;
    x?: NumberProp;
    y?: NumberProp;
    width?: NumberProp;
    height?: NumberProp;
}
export default class ForeignObject extends G<ForeignObjectProps> {
    static displayName: string;
    static defaultProps: {
        x: string;
        y: string;
        width: string;
        height: string;
    };
    render(): React.JSX.Element;
}
//# sourceMappingURL=ForeignObject.d.ts.map