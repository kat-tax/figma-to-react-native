import {parseDeclaration} from './parse';
import {kebabToCamelCase, allEqual} from './utils';

import type * as LightningCSS from 'lightningcss-wasm';
import type {
  ParseDeclarationOptions,
  RuntimeValue,
  ExtractedStyle,
  ExtractionWarning,
  ExtractRuleOptions,
} from './types';

/**
 * Extracts style declarations from a given CSS rule, based on its type.
 *
 * @param rule - The CSS rule to extract style declarations from.
 * @param extractOptions - Options for the extraction process, including maps for storing extracted data.
 * @param parseOptions - Options for parsing the CSS code
 */
export function extractRule(
  rule: LightningCSS.Rule,
  extractOptions: ExtractRuleOptions,
  partialStyle: Partial<ExtractedStyle> = {},
) {
  // Check the rule's type to determine which extraction function to call
  switch (rule.type) {
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
