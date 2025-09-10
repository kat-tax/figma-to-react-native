import * as React from 'react';
import Shape from './Shape';
import type { CommonPathProps, NumberProp } from '../lib/extract/types';
export interface PolylineProps extends CommonPathProps {
    opacity?: NumberProp;
    points?: string | ReadonlyArray<NumberProp>;
}
export default class Polyline extends Shape<PolylineProps> {
    static displayName: string;
    static defaultProps: {
        points: string;
    };
    setNativeProps: (props: PolylineProps & {
        d?: string;
    }) => void;
    render(): React.JSX.Element;
}
//# sourceMappingURL=Polyline.d.ts.map