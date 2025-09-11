import FilterPrimitive from './FilterPrimitive';
export interface FeTileProps {
    in?: string;
}
export default class FeTile extends FilterPrimitive<FeTileProps> {
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
//# sourceMappingURL=FeTile.d.ts.map