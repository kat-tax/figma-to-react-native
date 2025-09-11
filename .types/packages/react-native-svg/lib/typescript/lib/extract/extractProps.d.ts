import type { ClipProps, ColorProps, extractedProps, FillProps, NumberProp, ResponderProps, StrokeProps, TransformProps } from './types';
export declare function propsAndStyles(props: object & {
    style?: [] | unknown;
}): any;
export default function extractProps(props: {
    id?: string;
    mask?: string;
    filter?: string;
    marker?: string;
    markerStart?: string;
    markerMid?: string;
    markerEnd?: string;
    clipPath?: string;
    display?: string;
    opacity?: NumberProp;
    onLayout?: () => void;
    testID?: string;
    accessibilityLabel?: string;
    accessible?: boolean;
} & TransformProps & ResponderProps & StrokeProps & FillProps & ColorProps & ClipProps, ref: object): extractedProps;
export declare function extract(instance: object, props: object & {
    style?: [] | unknown;
}): extractedProps;
export declare function withoutXY(instance: object, props: object & {
    style?: [] | unknown;
}): extractedProps;
//# sourceMappingURL=extractProps.d.ts.map