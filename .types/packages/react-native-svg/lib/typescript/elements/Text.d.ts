import type { ReactNode } from 'react';
import * as React from 'react';
import type { ColumnMajorTransformMatrix, NumberArray, NumberProp, TextSpecificProps } from '../lib/extract/types';
import Shape from './Shape';
import './TSpan';
export interface TextProps extends TextSpecificProps {
    children?: ReactNode;
    x?: NumberArray;
    y?: NumberArray;
    dx?: NumberArray;
    dy?: NumberArray;
    rotate?: NumberArray;
    opacity?: NumberProp;
    inlineSize?: NumberProp;
}
export default class Text extends Shape<TextProps> {
    static displayName: string;
    setNativeProps: (props: TextProps & {
        matrix?: ColumnMajorTransformMatrix;
        style?: [] | unknown;
    }) => void;
    render(): React.JSX.Element;
}
//# sourceMappingURL=Text.d.ts.map