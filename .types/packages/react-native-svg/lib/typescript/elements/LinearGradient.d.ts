import type { ReactElement } from 'react';
import * as React from 'react';
import type { NumberProp, TransformProps, Units } from '../lib/extract/types';
import Shape from './Shape';
export interface LinearGradientProps {
    children?: ReactElement[];
    x1?: NumberProp;
    x2?: NumberProp;
    y1?: NumberProp;
    y2?: NumberProp;
    gradientUnits?: Units;
    gradientTransform?: TransformProps['transform'];
    id?: string;
}
export default class LinearGradient extends Shape<LinearGradientProps> {
    static displayName: string;
    static defaultProps: {
        x1: string;
        y1: string;
        x2: string;
        y2: string;
    };
    render(): React.JSX.Element;
}
//# sourceMappingURL=LinearGradient.d.ts.map