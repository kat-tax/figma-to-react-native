import { Component } from 'react';
import { NumberProp } from '../../lib/extract/types';
export interface FePointLightProps {
    x?: NumberProp;
    y?: NumberProp;
    z?: NumberProp;
}
export default class FePointLight extends Component<FePointLightProps> {
    static displayName: string;
    static defaultProps: {};
    render(): null;
}
//# sourceMappingURL=FePointLight.d.ts.map