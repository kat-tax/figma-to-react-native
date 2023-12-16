import parseLength from './length';

import type {LineHeight} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (lineHeight: LineHeight, options: ParseDeclarationOptionsWithValueWarning) => {
  switch (lineHeight.type) {
    case 'normal':
      return undefined;
    case 'number':
      return {
        type: 'runtime',
        name: 'em',
        arguments: [lineHeight.value],
      };
    case 'length': {
      const length = lineHeight.value;

      switch (length.type) {
        case 'dimension':
          return parseLength(length, options);
        case 'percentage':
        case 'calc':
          options.addValueWarning(length.value);
          return undefined;
      }
    }
  }
}
