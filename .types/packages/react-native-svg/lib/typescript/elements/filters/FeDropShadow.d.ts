import React from 'react';
import { ColorValue } from 'react-native';
import { NumberArray, NumberProp } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
export interface FeDropShadowProps {
    in?: string;
    stdDeviation?: NumberArray;
    dx?: NumberProp;
    dy?: NumberProp;
    floodColor?: ColorValue;
    floodOpacity?: NumberProp;
}
export default class FeDropShadow extends FilterPrimitive<FeDropShadowProps> {
    static displayName: string;
    static defaultProps: {
        x?: NumberProp;
        y?: NumberProp;
        width?: NumberProp;
        height?: NumberProp;
        result?: string;
    };
    render(): React.JSX.Element;
}
//# sourceMappingURL=FeDropShadow.d.ts.map