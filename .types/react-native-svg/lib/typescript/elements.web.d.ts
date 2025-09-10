import type { CircleProps } from './elements/Circle';
import type { ClipPathProps } from './elements/ClipPath';
import type { EllipseProps } from './elements/Ellipse';
import type { FeBlendProps } from './elements/filters/FeBlend';
import type { FeColorMatrixProps } from './elements/filters/FeColorMatrix';
import type { FeComponentTransferProps } from './elements/filters/FeComponentTransfer';
import type { FeFuncAProps, FeFuncBProps, FeFuncGProps, FeFuncRProps } from './elements/filters/FeComponentTransferFunction';
import type { FeCompositeProps } from './elements/filters/FeComposite';
import type { FeConvolveMatrixProps } from './elements/filters/FeConvolveMatrix';
import type { FeDiffuseLightingProps } from './elements/filters/FeDiffuseLighting';
import type { FeDisplacementMapProps } from './elements/filters/FeDisplacementMap';
import type { FeDistantLightProps } from './elements/filters/FeDistantLight';
import type { FeDropShadowProps } from './elements/filters/FeDropShadow';
import type { FeFloodProps } from './elements/filters/FeFlood';
import type { FeGaussianBlurProps } from './elements/filters/FeGaussianBlur';
import type { FeImageProps } from './elements/filters/FeImage';
import type { FeMergeProps } from './elements/filters/FeMerge';
import type { FeMergeNodeProps } from './elements/filters/FeMergeNode';
import type { FeMorphologyProps } from './elements/filters/FeMorphology';
import type { FeOffsetProps } from './elements/filters/FeOffset';
import type { FePointLightProps } from './elements/filters/FePointLight';
import type { FeSpecularLightingProps } from './elements/filters/FeSpecularLighting';
import type { FeSpotLightProps } from './elements/filters/FeSpotLight';
import type { FeTileProps } from './elements/filters/FeTile';
import type { FeTurbulenceProps } from './elements/filters/FeTurbulence';
import type { FilterProps } from './elements/filters/Filter';
import type { ForeignObjectProps } from './elements/ForeignObject';
import type { GProps } from './elements/G';
import type { ImageProps } from './elements/Image';
import type { LineProps } from './elements/Line';
import type { LinearGradientProps } from './elements/LinearGradient';
import type { MarkerProps } from './elements/Marker';
import type { MaskProps } from './elements/Mask';
import type { PathProps } from './elements/Path';
import type { PatternProps } from './elements/Pattern';
import type { PolygonProps } from './elements/Polygon';
import type { PolylineProps } from './elements/Polyline';
import type { RadialGradientProps } from './elements/RadialGradient';
import type { RectProps } from './elements/Rect';
import type { StopProps } from './elements/Stop';
import type { SvgProps } from './elements/Svg';
import type { SymbolProps } from './elements/Symbol';
import type { TextProps } from './elements/Text';
import type { TextPathProps } from './elements/TextPath';
import type { TSpanProps } from './elements/TSpan';
import type { UseProps } from './elements/Use';
import type { BaseProps } from './web/types';
import { WebShape } from './web/WebShape';
export declare class Circle extends WebShape<BaseProps & CircleProps> {
    tag: "circle";
}
export declare class ClipPath extends WebShape<BaseProps & ClipPathProps> {
    tag: "clipPath";
}
export declare class Defs extends WebShape {
    tag: "defs";
}
export declare class Ellipse extends WebShape<BaseProps & EllipseProps> {
    tag: "ellipse";
}
export declare class FeBlend extends WebShape<BaseProps & FeBlendProps> {
    tag: "feBlend";
}
export declare class FeColorMatrix extends WebShape<BaseProps & FeColorMatrixProps> {
    tag: "feColorMatrix";
}
export declare class FeComponentTransfer extends WebShape<BaseProps & FeComponentTransferProps> {
    tag: "feComponentTransfer";
}
export declare class FeComposite extends WebShape<BaseProps & FeCompositeProps> {
    tag: "feComposite";
}
export declare class FeConvolveMatrix extends WebShape<BaseProps & FeConvolveMatrixProps> {
    tag: "feConvolveMatrix";
}
export declare class FeDiffuseLighting extends WebShape<BaseProps & FeDiffuseLightingProps> {
    tag: "feDiffuseLighting";
}
export declare class FeDisplacementMap extends WebShape<BaseProps & FeDisplacementMapProps> {
    tag: "feDisplacementMap";
}
export declare class FeDistantLight extends WebShape<BaseProps & FeDistantLightProps> {
    tag: "feDistantLight";
}
export declare class FeDropShadow extends WebShape<BaseProps & FeDropShadowProps> {
    tag: "feDropShadow";
}
export declare class FeFlood extends WebShape<BaseProps & FeFloodProps> {
    tag: "feFlood";
}
export declare class FeFuncA extends WebShape<BaseProps & FeFuncAProps> {
    tag: "feFuncA";
}
export declare class FeFuncB extends WebShape<BaseProps & FeFuncBProps> {
    tag: "feFuncB";
}
export declare class FeFuncG extends WebShape<BaseProps & FeFuncGProps> {
    tag: "feFuncG";
}
export declare class FeFuncR extends WebShape<BaseProps & FeFuncRProps> {
    tag: "feFuncR";
}
export declare class FeGaussianBlur extends WebShape<BaseProps & FeGaussianBlurProps> {
    tag: "feGaussianBlur";
}
export declare class FeImage extends WebShape<BaseProps & FeImageProps> {
    tag: "feImage";
}
export declare class FeMerge extends WebShape<BaseProps & FeMergeProps> {
    tag: "feMerge";
}
export declare class FeMergeNode extends WebShape<BaseProps & FeMergeNodeProps> {
    tag: "feMergeNode";
}
export declare class FeMorphology extends WebShape<BaseProps & FeMorphologyProps> {
    tag: "feMorphology";
}
export declare class FeOffset extends WebShape<BaseProps & FeOffsetProps> {
    tag: "feOffset";
}
export declare class FePointLight extends WebShape<BaseProps & FePointLightProps> {
    tag: "fePointLight";
}
export declare class FeSpecularLighting extends WebShape<BaseProps & FeSpecularLightingProps> {
    tag: "feSpecularLighting";
}
export declare class FeSpotLight extends WebShape<BaseProps & FeSpotLightProps> {
    tag: "feSpotLight";
}
export declare class FeTile extends WebShape<BaseProps & FeTileProps> {
    tag: "feTile";
}
export declare class FeTurbulence extends WebShape<BaseProps & FeTurbulenceProps> {
    tag: "feTurbulence";
}
export declare class Filter extends WebShape<BaseProps & FilterProps> {
    tag: "filter";
}
export declare class ForeignObject extends WebShape<BaseProps & ForeignObjectProps> {
    tag: "foreignObject";
}
export declare class G extends WebShape<BaseProps & GProps> {
    tag: "g";
    prepareProps(props: BaseProps & GProps): {
        accessible?: boolean;
        accessibilityLabel?: string;
        accessibilityHint?: string;
        accessibilityIgnoresInvertColors?: boolean;
        accessibilityRole?: string;
        accessibilityState?: object;
        delayLongPress?: number;
        delayPressIn?: number;
        delayPressOut?: number;
        disabled?: boolean;
        hitSlop?: object;
        href?: import("react-native").ImageProps["source"] | string | number;
        nativeID?: string;
        touchSoundDisabled?: boolean;
        onBlur?: (e: object) => void;
        onFocus?: (e: object) => void;
        onLayout?: (((event: object) => object) & ((event: import("react-native").LayoutChangeEvent) => void)) | undefined;
        onLongPress?: (((event: object) => object) & ((event: import("react-native").GestureResponderEvent) => void)) | undefined;
        onClick?: (event: object) => object;
        onPress?: (((event: object) => object) & ((event: import("react-native").GestureResponderEvent) => void)) | undefined;
        onPressIn?: (((event: object) => object) & ((event: import("react-native").GestureResponderEvent) => void)) | undefined;
        onPressOut?: (((event: object) => object) & ((event: import("react-native").GestureResponderEvent) => void)) | undefined;
        pressRetentionOffset?: object;
        rejectResponderTermination?: boolean;
        transform?: import("./ReactNativeSVG").TransformProps["transform"];
        translate?: import("./ReactNativeSVG").NumberArray;
        translateX?: import("./ReactNativeSVG").NumberProp;
        translateY?: import("./ReactNativeSVG").NumberProp;
        scale?: import("./ReactNativeSVG").NumberArray;
        scaleX?: import("./ReactNativeSVG").NumberProp;
        scaleY?: import("./ReactNativeSVG").NumberProp;
        rotation?: import("./ReactNativeSVG").NumberProp;
        skewX?: import("./ReactNativeSVG").NumberProp;
        skewY?: import("./ReactNativeSVG").NumberProp;
        origin?: import("./ReactNativeSVG").NumberArray;
        originX?: import("./ReactNativeSVG").NumberProp;
        originY?: import("./ReactNativeSVG").NumberProp;
        fontStyle?: "normal" | "italic" | "oblique" | undefined;
        fontWeight?: string | number | undefined;
        fontSize?: import("./ReactNativeSVG").NumberProp;
        fontFamily?: string;
        forwardedRef?: React.RefCallback<SVGElement> | React.MutableRefObject<SVGElement | null>;
        style?: Iterable<unknown>;
        gradientTransform?: import("./ReactNativeSVG").TransformProps["transform"];
        patternTransform?: import("./ReactNativeSVG").TransformProps["transform"];
        children?: import("react").ReactNode;
        opacity?: import("./ReactNativeSVG").NumberProp;
        color?: import("react-native").ColorValue;
        fill?: import("react-native").ColorValue;
        fillOpacity?: import("./ReactNativeSVG").NumberProp;
        fillRule?: import("./ReactNativeSVG").FillRule;
        stroke?: import("react-native").ColorValue;
        strokeWidth?: import("./ReactNativeSVG").NumberProp;
        strokeOpacity?: import("./ReactNativeSVG").NumberProp;
        strokeDasharray?: ReadonlyArray<import("./ReactNativeSVG").NumberProp> | import("./ReactNativeSVG").NumberProp;
        strokeDashoffset?: import("./ReactNativeSVG").NumberProp;
        strokeLinecap?: import("./ReactNativeSVG").Linecap;
        strokeLinejoin?: import("./ReactNativeSVG").Linejoin;
        strokeMiterlimit?: import("./ReactNativeSVG").NumberProp;
        vectorEffect?: import("./ReactNativeSVG").VectorEffect;
        clipRule?: import("./ReactNativeSVG").FillRule;
        clipPath?: string;
        skew?: import("./ReactNativeSVG").NumberArray;
        pointerEvents?: "box-none" | "none" | "box-only" | "auto";
        onStartShouldSetResponder?: ((event: import("react-native").GestureResponderEvent) => boolean) | undefined;
        onMoveShouldSetResponder?: ((event: import("react-native").GestureResponderEvent) => boolean) | undefined;
        onResponderEnd?: ((event: import("react-native").GestureResponderEvent) => void) | undefined;
        onResponderGrant?: ((event: import("react-native").GestureResponderEvent) => void) | undefined;
        onResponderReject?: ((event: import("react-native").GestureResponderEvent) => void) | undefined;
        onResponderMove?: ((event: import("react-native").GestureResponderEvent) => void) | undefined;
        onResponderRelease?: ((event: import("react-native").GestureResponderEvent) => void) | undefined;
        onResponderStart?: ((event: import("react-native").GestureResponderEvent) => void) | undefined;
        onResponderTerminationRequest?: ((event: import("react-native").GestureResponderEvent) => boolean) | undefined;
        onResponderTerminate?: ((event: import("react-native").GestureResponderEvent) => void) | undefined;
        onStartShouldSetResponderCapture?: ((event: import("react-native").GestureResponderEvent) => boolean) | undefined;
        onMoveShouldSetResponderCapture?: ((event: import("react-native").GestureResponderEvent) => boolean) | undefined;
        id?: string;
        marker?: string;
        markerStart?: string;
        markerMid?: string;
        markerEnd?: string;
        mask?: string;
        filter?: string;
        testID?: string;
        font?: import("./ReactNativeSVG").FontObject;
        fontVariant?: import("./ReactNativeSVG").FontVariant;
        fontStretch?: import("./ReactNativeSVG").FontStretch;
        textAnchor?: import("./ReactNativeSVG").TextAnchor;
        textDecoration?: import("./ReactNativeSVG").TextDecoration;
        letterSpacing?: import("./ReactNativeSVG").NumberProp;
        wordSpacing?: import("./ReactNativeSVG").NumberProp;
        kerning?: import("./ReactNativeSVG").NumberProp;
        fontFeatureSettings?: string;
        fontVariantLigatures?: import("./ReactNativeSVG").FontVariantLigatures;
        fontVariationSettings?: string;
    };
}
export declare class Image extends WebShape<BaseProps & ImageProps> {
    tag: "image";
}
export declare class Line extends WebShape<BaseProps & LineProps> {
    tag: "line";
}
export declare class LinearGradient extends WebShape<BaseProps & LinearGradientProps> {
    tag: "linearGradient";
}
export declare class Marker extends WebShape<BaseProps & MarkerProps> {
    tag: "marker";
}
export declare class Mask extends WebShape<BaseProps & MaskProps> {
    tag: "mask";
}
export declare class Path extends WebShape<BaseProps & PathProps> {
    tag: "path";
}
export declare class Pattern extends WebShape<BaseProps & PatternProps> {
    tag: "pattern";
}
export declare class Polygon extends WebShape<BaseProps & PolygonProps> {
    tag: "polygon";
}
export declare class Polyline extends WebShape<BaseProps & PolylineProps> {
    tag: "polyline";
}
export declare class RadialGradient extends WebShape<BaseProps & RadialGradientProps> {
    tag: "radialGradient";
}
export declare class Rect extends WebShape<BaseProps & RectProps> {
    tag: "rect";
}
export declare class Stop extends WebShape<BaseProps & StopProps> {
    tag: "stop";
}
export declare class Svg extends WebShape<BaseProps & SvgProps> {
    tag: "svg";
    toDataURL(callback: (data: string) => void, options?: {
        width?: number;
        height?: number;
    }): void;
}
export declare class Symbol extends WebShape<BaseProps & SymbolProps> {
    tag: "symbol";
}
export declare class TSpan extends WebShape<BaseProps & TSpanProps> {
    tag: "tspan";
}
export declare class Text extends WebShape<BaseProps & TextProps> {
    tag: "text";
}
export declare class TextPath extends WebShape<BaseProps & TextPathProps> {
    tag: "textPath";
}
export declare class Use extends WebShape<BaseProps & UseProps> {
    tag: "use";
}
export default Svg;
//# sourceMappingURL=elements.web.d.ts.map