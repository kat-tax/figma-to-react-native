import type { ReactNode } from 'react';
import * as React from 'react';
import type { CommonPathProps, FontProps, NumberProp } from '../lib/extract/types';
import Shape from './Shape';
export interface GProps extends CommonPathProps, FontProps {
    children?: ReactNode;
    opacity?: NumberProp;
}
export default class G<P> extends Shape<GProps & P> {
    static displayName: string;
    setNativeProps: (props: GProps & P & {
        matrix?: number[];
    }) => void;
    render(): React.JSX.Element;
}
//# sourceMappingURL=G.d.ts.map