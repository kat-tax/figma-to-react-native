export interface StyleSheetOutput {
  declarations?: Record<string, ExtractedStyle | ExtractedStyle[]>;
};

// Extraction Types

export type ExtractedOutput = Map<string, ExtractedStyle | ExtractedStyle[]>;
export type ExtractedStyle = Record<string, ExtractedStyleValue>;
export type ExtractedStyleValue =
  | string
  | number
  | RuntimeValue
  | ExtractedStyleValue[]
  | (() => ExtractedStyleValue);

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

export type RuntimeValue = {
  type: 'runtime';
  name: string;
  arguments: any[];
};

// Parse Types

export interface ParseDeclarationOptions {
  inlineRem?: number | false;
  addStyleProp: AddStyleProp;
  addWarning: AddWarning;
  handleStyleShorthand: HandleStyleShorthand;
}

export interface ParseDeclarationOptionsWithValueWarning extends ParseDeclarationOptions {
  addValueWarning: (value: any) => undefined;
  addFunctionValueWarning: (value: any) => undefined;
}

export type AddStyleProp = (
  property: string,
  value: unknown,
) => void;

export type AddWarning = (
  warning: ExtractionWarning
) => undefined;

export type HandleStyleShorthand = (
  property: string,
  options: Record<string, unknown>,
) => void;
