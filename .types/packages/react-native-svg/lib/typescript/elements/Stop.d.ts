import { Component } from 'react';
import type { ColorValue } from 'react-native';
import type { NumberProp } from '../lib/extract/types';
export interface StopProps {
    stopColor?: ColorValue;
    stopOpacity?: NumberProp;
    offset?: NumberProp;
    parent?: Component;
}
export default class Stop extends Component<StopProps> {
    static displayName: string;
    setNativeProps: () => void;
    render(): null;
}
//# sourceMappingURL=Stop.d.ts.map