import parseAngle from './angle';
import parseColor from './color';
import parseLength from './length';
import parseDimension from './dimension';

import {invalidIdent} from '../val';
import {round} from '../utils';

import type {TokenOrValue} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

type UnparsedInput = TokenOrValue | TokenOrValue[] | string | number | undefined;
type UnparsedOutput = string | number | object | undefined;

/**
 * When the CSS cannot be parsed (often due to a runtime condition like a CSS variable)
 * This function best efforts parsing it into a function that we can evaluate at runtime
 */
export default (tokenOrValue: UnparsedInput, options: ParseDeclarationOptionsWithValueWarning): UnparsedOutput => {
  return parseUnparsed(tokenOrValue, options);
}

function parseUnparsed(tokenOrValue: UnparsedInput, options: ParseDeclarationOptionsWithValueWarning): UnparsedOutput {
  if (tokenOrValue === undefined) {
    return;
  }

  if (typeof tokenOrValue === 'string') {
    return tokenOrValue;
  }

  if (typeof tokenOrValue === 'number') {
    return round(tokenOrValue);
  }

  if (Array.isArray(tokenOrValue)) {
    return reduceParseUnparsed(tokenOrValue, options, true);
  }

  switch (tokenOrValue.type) {
    case 'unresolved-color': {
      const value = tokenOrValue.value;
      if (value.type === 'rgb') {
        return {
          type: 'runtime',
          name: 'rgba',
          arguments: [
            round(value.r * 255),
            round(value.g * 255),
            round(value.b * 255),
            parseUnparsed(tokenOrValue.value.alpha, options),
          ],
        };
      } else {
        return {
          type: 'runtime',
          name: tokenOrValue.value.type,
          arguments: [
            value.h,
            value.s,
            value.l,
            parseUnparsed(tokenOrValue.value.alpha, options),
          ],
        };
      }
    }
    case 'var': {
      return {
        type: 'runtime',
        name: 'var',
        arguments: [tokenOrValue.value.name.ident, tokenOrValue.value.fallback],
      };
    }
    case 'function': {
      switch (tokenOrValue.value.name) {
        case 'rgb':
          tokenOrValue.value.name = 'rgb';
          return unparsedFunction(tokenOrValue, options);
        case 'hsl':
          tokenOrValue.value.name = 'hsla';
          return unparsedFunction(tokenOrValue, options);
        case 'translate':
          return unparsedKnownShorthand(
            {
              translateX: tokenOrValue.value.arguments[0],
              translateY: tokenOrValue.value.arguments[2],
            },
            options,
          );
        case 'scale':
          return unparsedKnownShorthand(
            {
              scaleX: tokenOrValue.value.arguments[0],
              scaleY: tokenOrValue.value.arguments[2],
            },
            options,
          );
        case 'rotate':
        case 'skewX':
        case 'skewY':
        case 'scaleX':
        case 'scaleY':
          return unparsedFunction(tokenOrValue, options);
        case 'platformColor':
        case 'getPixelSizeForLayoutSize':
        case 'roundToNearestPixel':
        case 'pixelScale':
        case 'fontScale':
        case 'shadow':
          return unparsedFunction(tokenOrValue, options);
        case 'hairlineWidth':
          return {
            type: 'runtime',
            name: tokenOrValue.value.name,
            arguments: [],
          };
        default: {
          options.addFunctionValueWarning(tokenOrValue.value.name);
          return;
        }
      }
    }
    case 'length':
      return parseLength(tokenOrValue.value, options);
    case 'angle':
      return parseAngle(tokenOrValue.value, options);
    case 'token':
      switch (tokenOrValue.value.type) {
        case 'string':
        case 'number':
        case 'ident':
          if (invalidIdent.has(tokenOrValue.value.value.toString())) {
            return options.addValueWarning(tokenOrValue.value.value);
          } else {
            return tokenOrValue.value.value;
          }
        case 'function':
          options.addValueWarning(tokenOrValue.value.value);
          return;
        case 'percentage':
          options.addValueWarning(`${tokenOrValue.value.value}%`);
          return;
        case 'dimension':
          return parseDimension(tokenOrValue.value, options);
        case 'at-keyword':
        case 'hash':
        case 'id-hash':
        case 'unquoted-url':
        case 'delim':
        case 'white-space':
        case 'comment':
        case 'colon':
        case 'semicolon':
        case 'comma':
        case 'include-match':
        case 'dash-match':
        case 'prefix-match':
        case 'suffix-match':
        case 'substring-match':
        case 'cdo':
        case 'cdc':
        case 'parenthesis-block':
        case 'square-bracket-block':
        case 'curly-bracket-block':
        case 'bad-url':
        case 'bad-string':
        case 'close-parenthesis':
        case 'close-square-bracket':
        case 'close-curly-bracket':
          return;
        default: {
          tokenOrValue.value satisfies never;
          return;
        }
      }
    case 'color':
      return parseColor(tokenOrValue.value, options);
    case 'url':
    case 'env':
    case 'time':
    case 'resolution':
    case 'dashed-ident':
      return;
  }
}

function reduceParseUnparsed(
  tokenOrValues: TokenOrValue[],
  options: ParseDeclarationOptionsWithValueWarning,
  allowUnwrap = false,
) {
  const result = tokenOrValues
    .flatMap((tokenOrValue) => parseUnparsed(tokenOrValue, options))
    .filter((v) => v !== undefined);

  if (result.length === 0) {
    return undefined;
  } else if (result.length === 1 && allowUnwrap) {
    return result[0];
  } else {
    return result;
  }
}

function unparsedFunction(
  token: Extract<TokenOrValue, { type: 'function' }>,
  options: ParseDeclarationOptionsWithValueWarning,
) {
  return {
    type: 'runtime',
    name: token.value.name,
    arguments: reduceParseUnparsed(token.value.arguments, options),
  };
}

function unparsedKnownShorthand(
  mapping: Record<string, TokenOrValue>,
  options: ParseDeclarationOptionsWithValueWarning,
) {
  return Object.entries(mapping).map(([name, tokenOrValue]) => {
    return {
      type: 'runtime',
      name,
      arguments: [parseUnparsed(tokenOrValue, options)],
    };
  });
}
