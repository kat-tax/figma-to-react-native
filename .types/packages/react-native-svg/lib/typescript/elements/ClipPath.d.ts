import type { ReactNode } from 'react';
import * as React from 'react';
import Shape from './Shape';
export interface ClipPathProps {
    children?: ReactNode;
    id?: string;
}
export default class ClipPath extends Shape<ClipPathProps> {
    static displayName: string;
    render(): React.JSX.Element;
}
//# sourceMappingURL=ClipPath.d.ts.map