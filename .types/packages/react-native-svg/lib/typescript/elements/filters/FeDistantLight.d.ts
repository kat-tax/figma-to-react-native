import { Component } from 'react';
import { NumberProp } from '../../lib/extract/types';
export interface FeDistantLightProps {
    azimuth?: NumberProp;
    elevation?: NumberProp;
}
export default class FeDistantLight extends Component<FeDistantLightProps> {
    static displayName: string;
    static defaultProps: {};
    render(): null;
}
//# sourceMappingURL=FeDistantLight.d.ts.map