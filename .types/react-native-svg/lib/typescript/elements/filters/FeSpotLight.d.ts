import { Component } from 'react';
import { NumberProp } from '../../lib/extract/types';
export interface FeSpotLightProps {
    x?: NumberProp;
    y?: NumberProp;
    z?: NumberProp;
    pointsAtX?: NumberProp;
    pointsAtY?: NumberProp;
    pointsAtZ?: NumberProp;
    specularExponent?: NumberProp;
    limitingConeAngle?: NumberProp;
}
export default class FeSpotLight extends Component<FeSpotLightProps> {
    static displayName: string;
    static defaultProps: {};
    render(): null;
}
//# sourceMappingURL=FeSpotLight.d.ts.map