import devPropertiesWithoutUnitsRegExp from './lib/devPropertiesWithoutUnitsRegExp';
import parse from './lib/parse';
import TokenStream from './lib/TokenStream';
import transforms from './transforms';
import {camelCase} from 'common/string';

// Note if this is wrong, you'll need to change tokenTypes.js too
const regexNumberOrLength = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)(?:px)?$/i;
const regexNumberOnly = /^[+-]?(?:\d*\.\d*|[1-9]\d*)(?:e[+-]?\d+)?$/i;
const regexBoolean = /^true|false$/i;
const regexNull = /^null$/i;
const regexUndefiend = /^undefined$/i;

export const transformRawValue = (propName, value) => {
  /*if (process.env.NODE_ENV !== 'production') {
    const needsUnit = !devPropertiesWithoutUnitsRegExp.test(propName)
    const isNumberWithoutUnit = regexNumberOnly.test(value)
    if (needsUnit && isNumberWithoutUnit) {
      console.warn(`Expected style "${propName}: ${value}" to contain units`);
    }
    if (!needsUnit && value !== '0' && !isNumberWithoutUnit) {
      console.warn(`Expected style "${propName}: ${value}" to be unitless`);
    }
  }*/

  const numberMatch = value.match(regexNumberOrLength);
  if (numberMatch !== null) return Number(numberMatch[1]);
  const boolMatch = value.match(regexBoolean);
  if (boolMatch !== null) return boolMatch[0].toLowerCase() === 'true';
  const nullMatch = value.match(regexNull);
  if (nullMatch !== null) return null;
  const undefinedMatch = value.match(regexUndefiend);
  if (undefinedMatch !== null) return undefined;

  return value;
}

const baseTransformShorthandValue = (propName, value) => {
  const ast = parse(value)
  // console.log('ast', ast, value);
  const tokenStream = new TokenStream(ast.nodes)
  return transforms[propName](tokenStream)
}

const transformShorthandValue =
  true
    ? baseTransformShorthandValue
    : (propName, value) => {
        try {
          return baseTransformShorthandValue(propName, value)
        } catch (e) {
          throw new Error(`Failed to parse declaration "${propName}: ${value}"`)
        }
      }

export const getStylesForProperty = (propName, inputValue, allowShorthand) => {
  const isRawValue = allowShorthand === false || !(propName in transforms)
  const value = inputValue.trim()

  const propValues = isRawValue
    ? { [propName]: transformRawValue(propName, value) }
    : transformShorthandValue(propName, value)

  return propValues
}

export const getPropertyName = propName => {
  const isCustomProp = /^--\w+/.test(propName)
  if (isCustomProp) {
    return propName
  }
  return camelCase(propName)
}
