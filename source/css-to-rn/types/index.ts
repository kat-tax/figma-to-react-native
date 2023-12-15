import type {
  Time,
  Animation,
  EasingFunction,
} from 'lightningcss-wasm';

import type {
  ViewStyle,
  TextStyle,
  ImageStyle,
  Dimensions,
  Appearance,
  PerpectiveTransform,
  RotateTransform,
  RotateXTransform,
  RotateYTransform,
  RotateZTransform,
  ScaleTransform,
  ScaleXTransform,
  ScaleYTransform,
  TranslateXTransform,
  TranslateYTransform,
  SkewXTransform,
  SkewYTransform,
  MatrixTransform,
} from 'react-native';

export type CssToReactNativeOptions = {
  inlineRem?: number | false;
  ignorePropertyWarningRegex?: (string | RegExp)[];
};

export interface ExtractRuleOptions extends CssToReactNativeOptions {
  declarations: Map<string, ExtractedStyle | ExtractedStyle[]>;
  keyframes: Map<string, ExtractedAnimation>;
}

export type RuntimeValue = {
  type: 'runtime';
  name: string;
  arguments: any[];
};

export type ExtractedStyleValue =
  | string
  | number
  | RuntimeValue
  | ExtractedStyleValue[]
  | (() => ExtractedStyleValue);

export type ExtractedStyle = {
  isDynamic?: boolean;
  variables?: Record<string, ExtractedStyleValue>;
  prop?: [string, string | true];
  style: Record<string, ExtractedStyleValue>;
  animations?: ExtractedAnimations;
  transition?: ExtractedTransition;
  requiresLayout?: boolean;
  warnings?: ExtractionWarning[];
};

export type StyleMeta = {
  alreadyProcessed?: true;
  variableProps?: Set<string>;
  variables?: Record<string, ExtractedStyleValue>;
  animations?: ExtractedAnimations;
  transition?: ExtractedTransition;
  requiresLayout?: boolean;
};

export type ExtractedAnimations = {
  [K in keyof Animation]?: Animation[K][];
};

export type ExtractedTransition = {
  /**
   * The delay before the transition starts.
   */
  delay?: Time[];
  /**
   * The duration of the transition.
   */
  duration?: Time[];
  /**
   * The property to transition.
   */
  property?: AnimatableCSSProperty[];
  /**
   * The easing function for the transition.
   */
  timingFunction?: EasingFunction[];
};

export type ExtractedAnimation = {
  frames: ExtractedKeyframe[];
  requiresLayout?: boolean;
};

export type ExtractedKeyframe = {
  selector: number;
  style: Record<string, ExtractedStyleValue>;
};

export type StyleSheetRegisterOptions = {
  declarations?: Record<string, ExtractedStyle | ExtractedStyle[]>;
  keyframes?: Record<string, ExtractedAnimation>;
};

export type Style = ViewStyle & TextStyle & ImageStyle;

export type TransformRecord = Partial<
  PerpectiveTransform &
  RotateTransform &
  RotateXTransform &
  RotateYTransform &
  RotateZTransform &
  ScaleTransform &
  ScaleXTransform &
  ScaleYTransform &
  TranslateXTransform &
  TranslateYTransform &
  SkewXTransform &
  SkewYTransform &
  MatrixTransform
>;

export type CamelToKebabCase<
  T extends string,
  A extends string = '',
> = T extends `${infer F}${infer R}`
  ? CamelToKebabCase<R, `${A}${F extends Lowercase<F> ? '' : '-'}${Lowercase<F>}`>
  : A;

export type KebabToCamelCase<S extends string> =
  S extends `${infer P1}-${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${KebabToCamelCase<P3>}`
    : Lowercase<S>;

export interface ResetOptions {
  dimensions?: Dimensions;
  appearance?: typeof Appearance;
}

export type ExtractionWarning =
  | ExtractionWarningProperty
  | ExtractionWarningValue
  | ExtractionWarningFunctionValue;

export type ExtractionWarningProperty = {
  type: 'IncompatibleNativeProperty';
  property: string;
};

export type ExtractionWarningValue = {
  type: 'IncompatibleNativeValue';
  property: string;
  value: any;
};

export type ExtractionWarningFunctionValue = {
  type: 'IncompatibleNativeFunctionValue';
  property: string;
  value: any;
};

/*
 * This is a list of all the CSS properties that can be animated
 * Source: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties
 */
export type AnimatableCSSProperty = (keyof Style | 'fill' | 'stroke') &
  KebabToCamelCase<
    | 'background-color'
    | 'border-bottom-color'
    | 'border-bottom-left-radius'
    | 'border-bottom-right-radius'
    | 'border-bottom-width'
    | 'border-color'
    | 'border-left-color'
    | 'border-left-width'
    | 'border-radius'
    | 'border-right-color'
    | 'border-right-width'
    | 'border-top-color'
    | 'border-top-width'
    | 'border-width'
    | 'bottom'
    | 'color'
    | 'fill'
    | 'flex'
    | 'flex-basis'
    | 'flex-grow'
    | 'flex-shrink'
    | 'font-size'
    | 'font-weight'
    | 'gap'
    | 'height'
    | 'left'
    | 'letter-spacing'
    | 'line-height'
    | 'margin'
    | 'margin-bottom'
    | 'margin-left'
    | 'margin-right'
    | 'margin-top'
    | 'max-height'
    | 'max-width'
    | 'min-height'
    | 'min-width'
    | 'object-position'
    | 'opacity'
    | 'order'
    | 'padding'
    | 'padding-bottom'
    | 'padding-left'
    | 'padding-right'
    | 'padding-top'
    | 'right'
    | 'rotate'
    | 'scale'
    | 'stroke'
    | 'text-decoration'
    | 'text-decoration-color'
    | 'top'
    | 'transform'
    | 'transform-origin'
    | 'translate'
    | 'vertical-align'
    | 'visibility'
    | 'width'
    | 'word-spacing'
    | 'z-index'
  >;
