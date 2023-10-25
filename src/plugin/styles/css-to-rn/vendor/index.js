import {createIdentifierCamel} from 'common/string';
import TokenStream from './lib/TokenStream';
import parse from './lib/parse';
import transforms from './transforms';

// Note if this is wrong, you'll need to change tokenTypes.js too
const regexNumberOrLength = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)(?:px)?$/i;
const regexBoolean = /^true|false$/i;
const regexNull = /^null$/i;
const regexUndefiend = /^undefined$/i;

export const transformRawValue = (propName, value) => {
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

const transformShorthandValue = (propName, value) => {
  const ast = parse(value);
  const tokenStream = new TokenStream(ast.nodes);
  return transforms[propName](tokenStream);
};

export const getStylesForProperty = (propName, inputValue, allowShorthand) => {
  const isRawValue = allowShorthand === false || !(propName in transforms);
  const value = inputValue.trim();
  const propValues = isRawValue
    ? {[propName]: transformRawValue(propName, value)}
    : transformShorthandValue(propName, value);
  return propValues;
}

export const getPropertyName = propName => {
  const isCustomProp = /^--\w+/.test(propName);
  if (isCustomProp) return propName;
  return createIdentifierCamel(propName);
}
