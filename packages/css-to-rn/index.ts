import init, {transform} from 'lightningcss-wasm';
import {parseDeclaration} from './declaration';
import {kebabToCamelCase, allEqual} from './utils';

import type * as LightningCSS from 'lightningcss-wasm';
import type {ParseDeclarationOptions} from './types/parse';
import type {
  RuntimeValue,
  ExtractedStyle,
  StyleSheetRegisterOptions,
  AnimatableCSSProperty,
  ExtractedAnimation,
  ExtractionWarning,
  ExtractRuleOptions,
  CssToReactNativeOptions,
} from './types/index';

export type {CssToReactNativeOptions};

let _loading = false;
let _loaded = false;

async function initWASM() {
  await init('https://esm.sh/lightningcss-wasm@1.22.1/lightningcss_node.wasm');
  _loading = false;
  _loaded = true;
}

/**
 * Converts a CSS file to a collection of style declarations that can be used with the StyleSheet API
 *
 * @param code - The CSS file contents
 * @param options - (Optional) Options for the conversion process
 * @returns An object containing the extracted style declarations and animations
 */
export async function cssToReactNative(
  code: string,
  options: CssToReactNativeOptions = {},
): Promise<StyleSheetRegisterOptions> {
  if (_loading) {
    // TODO: use barrier instead of throwing
    throw new Error(
      'The WASM module is still loading. Please wait for the module to finish loading before using the `cssToReactNative` function.',
    );
  }
  if (!_loaded) {
    _loading = true;
    await initWASM();
  }

  // These will by mutated by `extractRule`
  const extractOptions: ExtractRuleOptions = {
    ...options,
    declarations: new Map(),
    keyframes: new Map(),
  };

  // Use LightningCSS to traverse the CSS AST
  // and extract style declarations and animations
  transform({
    // This is ignored, but required
    filename: 'style.css',
    code: new TextEncoder().encode(code),
    visitor: {
      Rule(rule: LightningCSS.Rule) {
        // Extract the style declarations and animations from the current rule
        extractRule(rule, extractOptions);
        // We have processed this rule, so now delete it from the AST
        return [];
      },
    },
  });

  // Convert the extracted style declarations and animations from maps to objects and return them
  return {
    declarations: Object.fromEntries(extractOptions.declarations),
    keyframes: Object.fromEntries(extractOptions.keyframes),
  };
}

/**
 * Converts a CSS file to a collection of style declarations that can be used with the StyleSheet API
 *
 * @param data - The object to transform to CSS
 */
export function buildCSS(data: {[s: string]: {[s: string]: unknown}}) {
  let css = '';
  for (const [id, styles] of Object.entries(data)) {
    css += `._${id.replace(/\:/g, '-')} { `;
    for (const [prop, value] of Object.entries(styles)) {
      // TODO: break this normalization out
      const _prop = prop === 'background' ? 'background-color' : prop;
      const _value = value === 'inline-flex' ? 'flex' : value;
      css += `${_prop}: ${_value}; `;
    }
    css += ' }\n';
  }
  return css;
}

/**
 * Extracts style declarations and animations from a given CSS rule, based on its type.
 *
 * @param rule - The CSS rule to extract style declarations and animations from.
 * @param extractOptions - Options for the extraction process, including maps for storing extracted data.
 * @param parseOptions - Options for parsing the CSS code
 */
function extractRule(
  rule: LightningCSS.Rule,
  extractOptions: ExtractRuleOptions,
  partialStyle: Partial<ExtractedStyle> = {},
) {
  // Check the rule's type to determine which extraction function to call
  switch (rule.type) {
    // If the rule is a keyframe animation, extract it with the `extractKeyFrames` function
    case 'keyframes': {
      extractKeyFrames(rule.value, extractOptions);
      break;
    }
    // If the rule is a style declaration, extract it with the `getExtractedStyle` function
    // and store it in the `declarations` map
    case 'style': {
      if (rule.value.declarations) {
        for (const style of getExtractedStyles(
          rule.value.declarations,
          extractOptions,
        )) {
          setStyleForSelectorList(
            { ...partialStyle, ...style },
            rule.value.selectors,
            extractOptions,
          );
        }
      }
      break;
    }
  }
}

/**
 * @param style - The ExtractedStyle object to use when setting styles.
 * @param selectorList - The SelectorList object containing the selectors to use when setting styles.
 * @param declarations - The declarations object to use when adding declarations.
 */
function setStyleForSelectorList(
  extractedStyle: ExtractedStyle,
  selectorList: LightningCSS.SelectorList,
  options: ExtractRuleOptions,
) {
  const {declarations} = options;

  for (const selector of normalizeSelectors(selectorList)) {
    const style = {...extractedStyle};
    const {className} = selector;
    addDeclaration(className, {...style}, declarations);
  }
}

function addDeclaration(
  className: string,
  style: ExtractedStyle,
  declarations: ExtractRuleOptions['declarations'],
) {
  const existing = declarations.get(className);

  if (Array.isArray(existing)) {
    existing.push(style);
  } else if (existing) {
    declarations.set(className, [existing, style]);
  } else {
    declarations.set(className, style);
  }
}

function extractKeyFrames(
  keyframes: LightningCSS.KeyframesRule<LightningCSS.Declaration>,
  extractOptions: ExtractRuleOptions,
) {
  const extractedAnimation: ExtractedAnimation = { frames: [] };
  const frames = extractedAnimation.frames;

  for (const frame of keyframes.keyframes) {
    if (!frame.declarations.declarations) continue;

    /**
     *  Animations ignore !important declarations
     */
    const { style } = declarationsToStyle(
      frame.declarations.declarations,
      {
        ...extractOptions,
        requiresLayout() {
          extractedAnimation.requiresLayout = true;
        },
      },
    );

    for (const selector of frame.selectors) {
      const keyframe =
        selector.type === 'percentage'
          ? selector.value * 100
          : selector.type === 'from'
          ? 0
          : selector.type === 'to'
          ? 100
          : undefined;

      if (keyframe === undefined) continue;

      switch (selector.type) {
        case 'percentage':
          frames.push({ selector: selector.value, style });
          break;
        case 'from':
          frames.push({ selector: 0, style });
          break;
        case 'to':
          frames.push({ selector: 1, style });
          break;
        default:
          selector satisfies never;
      }
    }
  }

  // Ensure there are always two frames, a start and end
  if (frames.length === 1) {
    frames.push({ selector: 0, style: {} });
  }

  extractedAnimation.frames = frames.sort((a, b) => a.selector - b.selector);

  extractOptions.keyframes.set(keyframes.name.value, extractedAnimation);
}

interface GetExtractedStyleOptions extends ExtractRuleOptions {
  requiresLayout?: () => void;
}

function getExtractedStyles(
  declarationBlock: LightningCSS.DeclarationBlock<LightningCSS.Declaration>,
  options: GetExtractedStyleOptions,
): ExtractedStyle[] {
  const extractedStyles: ExtractedStyle[] = [];

  if (declarationBlock.declarations && declarationBlock.declarations.length) {
    extractedStyles.push(
      declarationsToStyle(declarationBlock.declarations, options),
    );
  }

  if (
    declarationBlock.importantDeclarations &&
    declarationBlock.importantDeclarations.length
  ) {
    extractedStyles.push(
      declarationsToStyle(declarationBlock.importantDeclarations, options),
    );
  }

  return extractedStyles;
}

function declarationsToStyle(
  declarations: LightningCSS.Declaration[],
  options: GetExtractedStyleOptions,
): ExtractedStyle {
  const extractedStyle: ExtractedStyle = {
    style: {},
  };

  /*
   * Adds a style property to the rule record.
   *
   * The shorthand option handles if the style came from a long or short hand property
   * E.g. `margin` is a shorthand property for `margin-top`, `margin-bottom`, `margin-left` and `margin-right`
   *
   * The `append` option allows the same property to be added multiple times
   * E.g. `transform` accepts an array of transforms
   */
  function addStyleProp(property: string, value: any, {append = false} = {}) {
    if (value === undefined) {
      return;
    }

    if (property.startsWith('--')) {
      return addVariable(property, value);
    }

    property = kebabToCamelCase(property);

    const style = extractedStyle.style;

    if (append) {
      const styleValue = style[property];
      if (Array.isArray(styleValue)) {
        styleValue.push(...value);
      } else {
        style[property] = [value];
      }
    } else {
      style[property] = value;
    }

    if (isRuntimeValue(value)) {
      extractedStyle.isDynamic = true;
    }
  }

  function handleStyleShorthand(
    name: string,
    options: Record<string, unknown>,
  ) {
    if (allEqual(...Object.values(options))) {
      return addStyleProp(name, Object.values(options)[0]);
    } else {
      for (const [name, value] of Object.entries(options)) {
        addStyleProp(name, value);
      }
    }
  }

  function addVariable(property: string, value: any) {
    extractedStyle.variables ??= {};
    extractedStyle.variables[property] = value;
  }

  function addTransitionProp(
    declaration: Extract<
      LightningCSS.Declaration,
      {
        property:
          | 'transition-property'
          | 'transition-duration'
          | 'transition-delay'
          | 'transition-timing-function'
          | 'transition';
      }
    >,
  ) {
    extractedStyle.transition ??= {};

    switch (declaration.property) {
      case 'transition-property':
        extractedStyle.transition.property = declaration.value.map((v: any) => {
          return kebabToCamelCase(v.property) as AnimatableCSSProperty;
        });
        break;
      case 'transition-duration':
        extractedStyle.transition.duration = declaration.value;
        break;
      case 'transition-delay':
        extractedStyle.transition.delay = declaration.value;
        break;
      case 'transition-timing-function':
        extractedStyle.transition.timingFunction = declaration.value;
        break;
      case 'transition': {
        let setProperty = true;
        let setDuration = true;
        let setDelay = true;
        let setTiming = true;

        // Shorthand properties cannot override the longhand property
        // So we skip setting the property if it already exists
        // Otherwise, we need to set the property to an empty array
        if (extractedStyle.transition.property) {
          setProperty = false;
        } else {
          extractedStyle.transition.property = [];
        }
        if (extractedStyle.transition.duration) {
          setDuration = false;
        } else {
          extractedStyle.transition.duration = [];
        }
        if (extractedStyle.transition.delay) {
          setDelay = false;
        } else {
          extractedStyle.transition.delay = [];
        }
        if (extractedStyle.transition.timingFunction) {
          setTiming = false;
        } else {
          extractedStyle.transition.timingFunction = [];
        }

        // Loop through each transition value and only set the properties that
        // were not already set by the longhand property
        for (const value of declaration.value) {
          if (setProperty) {
            extractedStyle.transition.property?.push(
              kebabToCamelCase(
                value.property.property,
              ) as AnimatableCSSProperty,
            );
          }
          if (setDuration) {
            extractedStyle.transition.duration?.push(value.duration);
          }
          if (setDelay) {
            extractedStyle.transition.delay?.push(value.delay);
          }
          if (setTiming) {
            extractedStyle.transition.timingFunction?.push(
              value.timingFunction,
            );
          }
        }
        break;
      }
    }
  }

  function addAnimationProp(property: string, value: any) {
    if (property === 'animation') {
      const groupedProperties: Record<string, any[]> = {};

      for (const animation of value as LightningCSS.Animation[]) {
        for (const [key, value] of Object.entries(animation)) {
          groupedProperties[key] ??= [];
          groupedProperties[key].push(value);
        }
      }

      extractedStyle.animations ??= {};
      for (const [property, value] of Object.entries(groupedProperties)) {
        const key = property
          .replace('animation-', '')
          .replace(/-./g, (x) => x[1].toUpperCase()) as keyof LightningCSS.Animation;

        extractedStyle.animations[key] ??= value;
      }
    } else {
      const key = property
        .replace('animation-', '')
        .replace(/-./g, (x) => x[1].toUpperCase()) as keyof LightningCSS.Animation;

      extractedStyle.animations ??= {};
      extractedStyle.animations[key] = value;
    }
  }

  function addWarning(warning: ExtractionWarning): undefined {
    const warningRegexArray = options.ignorePropertyWarningRegex;

    if (warningRegexArray) {
      const match = warningRegexArray.some((regex) =>
        new RegExp(regex).test(warning.property),
      );

      if (match) return;
    }

    extractedStyle.warnings ??= [];
    extractedStyle.warnings.push(warning);

    console.warn(warning);
  }

  function requiresLayout() {
    extractedStyle.requiresLayout = true;
  }

  const parseDeclarationOptions: ParseDeclarationOptions = {
    addStyleProp,
    handleStyleShorthand,
    addAnimationProp,
    addTransitionProp,
    requiresLayout,
    addWarning,
    ...options,
  };

  for (const declaration of declarations) {
    parseDeclaration(declaration, parseDeclarationOptions);
  }

  return extractedStyle;
}

function isRuntimeValue(value: unknown): value is RuntimeValue {
  if (!value) {
    return false;
  } else if (Array.isArray(value)) {
    return value.some((v) => isRuntimeValue(v));
  } else if (typeof value === "object") {
    if ((value as Record<string, unknown>).type === "runtime") {
      return true;
    } else {
      return Object.values(value).some((v) => isRuntimeValue(v));
    }
  } else {
    return false;
  }
}

type NormalizeSelector = {
  type: 'className',
  className: string,
};

function normalizeSelectors(
  selectorList: LightningCSS.SelectorList,
  selectors: NormalizeSelector[] = [],
  defaults: Partial<NormalizeSelector> = {},
) {
  for (const lightningSelector of selectorList) {
    const selector: NormalizeSelector = {
      ...defaults,
      className: '',
      type: 'className',
    };
    for (const component of lightningSelector) {
      switch (component.type) {
        case 'class': {
          selector.className = component.name;
          break;
        }
      }
    }
    selectors.push(selector);
  }
  return selectors;
}
