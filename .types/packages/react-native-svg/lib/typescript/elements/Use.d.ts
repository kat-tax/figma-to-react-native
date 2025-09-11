import type { ReactNode } from 'react';
import * as React from 'react';
import type { CommonPathProps, NumberProp } from '../lib/extract/types';
import Shape from './Shape';
export interface UseProps extends CommonPathProps {
    children?: ReactNode;
    xlinkHref?: string;
    href?: string;
    width?: NumberProp;
    height?: NumberProp;
    x?: NumberProp;
    y?: NumberProp;
    opacity?: NumberProp;
}
export default class Use extends Shape<UseProps> {
    static displayName: string;
    static defaultProps: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    render(): React.JSX.Element;
}
//# sourceMappingURL=Use.d.ts.map