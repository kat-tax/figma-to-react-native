import type {Declaration} from 'lightningcss-wasm';
import type {ExtractionWarning} from './index';

export interface ParseDeclarationOptions {
  inlineRem?: number | false;
  addStyleProp: AddStyleProp;
  handleStyleShorthand: HandleStyleShorthand;
  addAnimationProp: AddAnimationDefaultProp;
  addTransitionProp: AddTransitionProp;
  addWarning: AddWarning;
  requiresLayout: () => void;
}

export interface ParseDeclarationOptionsWithValueWarning extends ParseDeclarationOptions {
  addValueWarning: (value: any) => undefined;
  addFunctionValueWarning: (value: any) => undefined;
}

export type AddWarning = (warning: ExtractionWarning) => undefined;
export type AddAnimationDefaultProp = (property: string, value: unknown[]) => void;

export type AddStyleProp = (
  property: string,
  value: unknown,
  options?: {
    shortHand?: boolean;
    append?: boolean;
  },
) => void;

export type HandleStyleShorthand = (
  property: string,
  options: Record<string, unknown>,
) => void;

export type AddTransitionProp = (declaration: Extract<Declaration, {
  property:
    | 'transition-property'
    | 'transition-duration'
    | 'transition-delay'
    | 'transition-timing-function'
    | 'transition';
}>) => void;
