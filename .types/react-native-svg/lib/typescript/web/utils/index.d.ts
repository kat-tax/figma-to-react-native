import { BaseProps } from '../types';
import type { TransformProps } from '../../lib/extract/types';
export declare const hasTouchableProperty: (props: BaseProps) => ((event: object) => object) | undefined;
export declare const camelCaseToDashed: (camelCase: string) => string;
export declare function parseTransformProp(transform: TransformProps['transform'], props?: BaseProps): string | undefined;
export declare const getBoundingClientRect: (node: SVGElement) => DOMRect;
export declare function remeasure(this: any): void;
export declare function encodeSvg(svgString: string): string;
//# sourceMappingURL=index.d.ts.map