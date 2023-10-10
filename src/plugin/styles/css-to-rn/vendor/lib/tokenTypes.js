import stringify from './parse/stringify';

const reNone = /^(none)$/i
const reAuto = /^(auto)$/i
const reIdent = /(^-?[_a-z][_a-z0-9-]*$)/i;
const reAngle = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?(?:deg|rad))$/i;
const reLength = /^(0$|(?:[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)(?=px$))/i; // Note: reLength is sneaky: you can omit units for 0
const reNumber = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)$/i; // Note: if these are wrong, you'll need to change index.js too
const rePercent = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?%)$/i;
const reColorHex = /^(#(?:[0-9a-f]{3,4}){1,2})$/i
const reCSSFunction = /^(rgba?|hsla?|hwb|lab|lch|gray|color|var)$/;
const reUnsupportedUnit = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?(ch|em|ex|rem|vh|vw|vmin|vmax|cm|mm|in|pc|pt))$/i;

const noopToken = predicate => node => (predicate(node) ? '<token>' : null);
const valueForTypeToken = type => node => node.type === type ? node.value : null;

const matchString = node => {
  return node.type === 'string' ? node.value
    .replace(
      /\\([0-9a-f]{1,6})(?:\s|$)/gi,
      (match, charCode) => String.fromCharCode(parseInt(charCode, 16)),
    )
    .replace(/\\/g, '')
  : null;
}

const matchColor = node => {
  if (node.type === 'word' && (reColorHex.test(node.value) || node.value === 'transparent')) {
    return node.value;
  } else if (node.type === 'function' && reCSSFunction.test(node.value)) {
    return stringify(node);
  }
  return null;
}


export const regexToken = (regex, transform = String) => node => {
  if (node.type !== 'word')
    return null;
  const match = node.value.match(regex);
  if (match === null)
    return null;
  const value = transform(match[1]);
  return value;
}

export const STRING = matchString;
export const COLOR = matchColor;
export const WORD = valueForTypeToken('word');
export const SPACE = noopToken(node => node.type === 'space');
export const SLASH = noopToken(node => node.type === 'div' && node.value === '/');
export const COMMA = noopToken(node => node.type === 'div' && node.value === ',');
export const LINE = regexToken(/^(none|underline|line-through)$/i)
export const NONE = regexToken(reNone);
export const AUTO = regexToken(reAuto);
export const IDENT = regexToken(reIdent)
export const ANGLE = regexToken(reAngle, angle => angle.toLowerCase())
export const LENGTH = regexToken(reLength, Number);
export const NUMBER = regexToken(reNumber, Number);
export const PERCENT = regexToken(rePercent)
export const UNSUPPORTED_LENGTH_UNIT = regexToken(reUnsupportedUnit);
