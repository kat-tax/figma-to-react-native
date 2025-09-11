import * as React from 'react';
import type { TextChild } from '../lib/extract/extractText';
import Shape from './Shape';
import type { ColumnMajorTransformMatrix, CommonPathProps, FontProps, NumberArray, NumberProp } from '../lib/extract/types';
export interface TSpanProps extends CommonPathProps, FontProps {
    children?: TextChild;
    x?: NumberArray;
    y?: NumberArray;
    dx?: NumberArray;
    dy?: NumberArray;
    rotate?: NumberArray;
    inlineSize?: NumberProp;
}
export default class TSpan extends Shape<TSpanProps> {
    static displayName: string;
    setNativeProps: (props: TSpanProps & {
        matrix?: ColumnMajorTransformMatrix;
        style?: [] | unknown;
    }) => void;
    render(): React.JSX.Element;
}
//# sourceMappingURL=TSpan.d.ts.map