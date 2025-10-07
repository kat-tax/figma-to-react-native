import type { ReactElement } from 'react';
import * as React from 'react';
import type { TransformProps } from './types';
export default function extractGradient(props: {
    id?: string;
    children?: ReactElement[];
    transform?: TransformProps['transform'];
    gradientTransform?: TransformProps['transform'];
    gradientUnits?: 'objectBoundingBox' | 'userSpaceOnUse';
} & TransformProps, parent: unknown): {
    name: string;
    gradient: number[];
    children: ReactElement<any, string | React.JSXElementConstructor<any>>[];
    gradientUnits: number;
    gradientTransform: import("./types").ColumnMajorTransformMatrix | null;
} | null;
//# sourceMappingURL=extractGradient.d.ts.map