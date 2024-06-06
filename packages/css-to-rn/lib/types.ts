import type * as RN from 'react-native';

export type CssToReactNativeOptions = {
  inlineRem?: number | false;
  ignorePropertyWarningRegex?: (string | RegExp)[];
};

export interface ExtractRuleOptions extends CssToReactNativeOptions {
  declarations: Map<string, ExtractedStyle | ExtractedStyle[]>;
  rootVariables?: VariableRecord;
  universalVariables?: VariableRecord;
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
  requiresLayout?: boolean;
  warnings?: ExtractionWarning[];
};

export type StyleMeta = {
  alreadyProcessed?: true;
  variableProps?: Set<string>;
  variables?: Record<string, ExtractedStyleValue>;
  requiresLayout?: boolean;
};

export type StyleSheetRegisterOptions = {
  declarations?: Record<string, ExtractedStyle | ExtractedStyle[]>;
};

export type Style = RN.ViewStyle & RN.TextStyle & RN.ImageStyle;

export type VariableRecord = Record<string, string>;

export type TransformRecord = Partial<
  RN.PerpectiveTransform &
  RN.RotateTransform &
  RN.RotateXTransform &
  RN.RotateYTransform &
  RN.RotateZTransform &
  RN.ScaleTransform &
  RN.ScaleXTransform &
  RN.ScaleYTransform &
  RN.TranslateXTransform &
  RN.TranslateYTransform &
  RN.SkewXTransform &
  RN.SkewYTransform &
  RN.MatrixTransform
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
  dimensions?: RN.Dimensions;
  appearance?: typeof RN.Appearance;
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

export interface ParseDeclarationOptions {
  inlineRem?: number | false;
  addStyleProp: AddStyleProp;
  addWarning: AddWarning;
  requiresLayout: () => void;
  handleStyleShorthand: HandleStyleShorthand;
}

export interface ParseDeclarationOptionsWithValueWarning extends ParseDeclarationOptions {
  addValueWarning: (value: any) => undefined;
  addFunctionValueWarning: (value: any) => undefined;
}

export type AddStyleProp = (
  property: string,
  value: unknown,
  options?: {
    shortHand?: boolean;
    append?: boolean;
  },
) => void;

export type AddWarning = (
  warning: ExtractionWarning
) => undefined;

export type HandleStyleShorthand = (
  property: string,
  options: Record<string, unknown>,
) => void;
