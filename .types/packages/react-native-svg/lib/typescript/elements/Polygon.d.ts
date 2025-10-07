import * as React from 'react';
import Shape from './Shape';
import type { CommonPathProps, NumberProp } from '../lib/extract/types';
export interface PolygonProps extends CommonPathProps {
    opacity?: NumberProp;
    points?: string | ReadonlyArray<NumberProp>;
}
export default class Polygon extends Shape<PolygonProps> {
    static displayName: string;
    static defaultProps: {
        points: string;
    };
    setNativeProps: (props: PolygonProps & {
        d?: string;
    }) => void;
    render(): React.JSX.Element;
}
//# sourceMappingURL=Polygon.d.ts.map