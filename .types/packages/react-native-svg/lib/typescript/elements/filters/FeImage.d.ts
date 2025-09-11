import FilterPrimitive from './FilterPrimitive';
export interface FeImageProps {
    href?: string;
    preserveAspectRatio?: string;
    crossOrigin?: 'anonymous' | 'use-credentials' | '';
}
export default class FeImage extends FilterPrimitive<FeImageProps> {
    static displayName: string;
    static defaultProps: {
        x?: import("../..").NumberProp;
        y?: import("../..").NumberProp;
        width?: import("../..").NumberProp;
        height?: import("../..").NumberProp;
        result?: string;
    };
    render(): null;
}
//# sourceMappingURL=FeImage.d.ts.map