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
  const name = className.slice(1).replace(/\-/g, ':');
  const existing = declarations.get(name);
  if (Array.isArray(existing)) {
    existing.push(style);
  } else if (existing) {
    declarations.set(name, [existing, style]);
  } else {
    declarations.set(name, style);
  }
}

function getExtractedStyles(
  declarationBlock: LightningCSS.DeclarationBlock<LightningCSS.Declaration>,
  options: ExtractRuleOptions,
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
  options: ExtractRuleOptions,
): ExtractedStyle {
  const extractedStyle: ExtractedStyle = {};

  /** Adds a style property to the rule record */
  function addStyleProp(property: string, value: any) {
    if (value === undefined) return;
    const prop = kebabToCamelCase(property);
    extractedStyle[prop] = isRuntimeValue(value)
      ? getRuntimeVar(value)
      : value;
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

  function addWarning(warning: ExtractionWarning): undefined {
    const warningRegexArray = options.ignorePropertyWarningRegex;

    if (warningRegexArray) {
      const match = warningRegexArray.some((regex) =>
        new RegExp(regex).test(warning.property),
      );

      if (match) return;
    }

    console.warn(warning);
  }

  const parseDeclarationOptions: ParseDeclarationOptions = {
    addStyleProp,
    handleStyleShorthand,
    addWarning,
    ...options,
  };

  for (const declaration of declarations) {
    parseDeclaration(declaration, parseDeclarationOptions);
  }

  return extractedStyle;
}

function getRuntimeVar(runtime: any) {
  const variable = runtime.arguments[0];
  return variable.slice(2).replace(/\-/g, '.');
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
