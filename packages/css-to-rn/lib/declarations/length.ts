import parseLength from './length';
import {round} from '../utils';

import type {Length, LengthValue, DimensionPercentageFor_LengthValue, NumberOrPercentage} from 'lightningcss-wasm';
import type {RuntimeValue, ParseDeclarationOptionsWithValueWarning} from '../types';

export default (
  length:
    | number
    | Length
    | DimensionPercentageFor_LengthValue
    | NumberOrPercentage
    | LengthValue,
  options: ParseDeclarationOptionsWithValueWarning,
): number | string | RuntimeValue | undefined => {
  const { inlineRem = 14 } = options;

  if (typeof length === 'number') {
    return length;
  }

  if ('unit' in length) {
    switch (length.unit) {
      case 'px':
        return length.value;
      case 'rem':
        if (typeof inlineRem === 'number') {
          return length.value * inlineRem;
        } else {
          return {
            type: 'runtime',
            name: 'rem',
            arguments: [length.value],
          };
        }
      case 'vw':
      case 'vh':
        return {
          type: 'runtime',
          name: length.unit,
          arguments: [length.value],
        };
      case 'in':
      case 'cm':
      case 'mm':
      case 'q':
      case 'pt':
      case 'pc':
      case 'em':
      case 'ex':
      case 'rex':
      case 'ch':
      case 'rch':
      case 'cap':
      case 'rcap':
      case 'ic':
      case 'ric':
      case 'lh':
      case 'rlh':
      case 'lvw':
      case 'svw':
      case 'dvw':
      case 'cqw':
      case 'lvh':
      case 'svh':
      case 'dvh':
      case 'cqh':
      case 'vi':
      case 'svi':
      case 'lvi':
      case 'dvi':
      case 'cqi':
      case 'vb':
      case 'svb':
      case 'lvb':
      case 'dvb':
      case 'cqb':
      case 'vmin':
      case 'svmin':
      case 'lvmin':
      case 'dvmin':
      case 'cqmin':
      case 'vmax':
      case 'svmax':
      case 'lvmax':
      case 'dvmax':
      case 'cqmax':
        options.addValueWarning(`${length.value}${length.unit}`);
        return undefined;
    }

    length.unit satisfies never;
  } else {
    switch (length.type) {
      case 'calc': {
        return undefined;
      }
      case 'number': {
        return round(length.value);
      }
      case 'percentage': {
        return `${round(length.value * 100)}%`;
      }
      case 'dimension':
      case 'value': {
        return parseLength(length.value, options);
      }
    }
  }
  return undefined;
}
