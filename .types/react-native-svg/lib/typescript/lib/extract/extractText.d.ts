import type { ComponentType } from 'react';
import * as React from 'react';
import type { NumberArray, NumberProp } from './types';
interface fontProps {
    fontData?: unknown;
    fontStyle?: string;
    fontVariant?: string;
    fontWeight?: NumberProp;
    fontStretch?: string;
    fontSize?: NumberProp;
    fontFamily?: string;
    textAnchor?: string;
    textDecoration?: string;
    letterSpacing?: NumberProp;
    wordSpacing?: NumberProp;
    kerning?: NumberProp;
    fontFeatureSettings?: string;
    fontVariantLigatures?: string;
    fontVariationSettings?: string;
    font?: string;
}
export declare function extractFont(props: fontProps): {
    fontStyle?: string | undefined;
    fontSize?: NumberProp | undefined;
    fontWeight?: NumberProp | undefined;
    fontFamily?: string | null | undefined;
};
export declare function setTSpan(TSpanImplementation: ComponentType): void;
export type TextChild = (undefined | string | number | ComponentType | React.ReactElement) | TextChild[];
export type TextProps = {
    x?: NumberArray;
    y?: NumberArray;
    dx?: NumberArray;
    dy?: NumberArray;
    rotate?: NumberArray;
    children?: TextChild;
    inlineSize?: NumberProp;
    baselineShift?: NumberProp;
    verticalAlign?: NumberProp;
    alignmentBaseline?: string;
} & fontProps;
export default function extractText(props: TextProps, container: boolean): {
    content: string | null;
    children: ComponentType | React.JSX.Element | (ComponentType | TextChild[] | React.JSX.Element)[] | null | undefined;
    inlineSize: NumberProp | undefined;
    baselineShift: NumberProp | undefined;
    verticalAlign: NumberProp | undefined;
    alignmentBaseline: string | undefined;
    font: {
        fontStyle?: string | undefined;
        fontSize?: NumberProp | undefined;
        fontWeight?: NumberProp | undefined;
        fontFamily?: string | null | undefined;
    };
    x: readonly NumberProp[];
    y: readonly NumberProp[];
    dx: readonly NumberProp[];
    dy: readonly NumberProp[];
    rotate: readonly NumberProp[];
};
export {};
//# sourceMappingURL=extractText.d.ts.map