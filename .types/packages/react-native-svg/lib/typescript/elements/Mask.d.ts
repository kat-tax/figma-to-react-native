import type { ReactNode } from 'react';
import * as React from 'react';
import type { CommonPathProps, MaskType, NumberProp, Units } from '../lib/extract/types';
import Shape from './Shape';
export interface MaskProps extends CommonPathProps {
    children?: ReactNode;
    id?: string;
    x?: NumberProp;
    y?: NumberProp;
    width?: NumberProp;
    height?: NumberProp;
    maskUnits?: Units;
    maskContentUnits?: Units;
    maskType?: MaskType;
    style?: {
        maskType: MaskType;
    };
}
export default class Mask extends Shape<MaskProps> {
    static displayName: string;
    static defaultProps: {
        x: string;
        y: string;
        width: string;
        height: string;
    };
    render(): React.JSX.Element;
}
//# sourceMappingURL=Mask.d.ts.map