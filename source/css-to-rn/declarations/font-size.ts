import parseLength from './length';

import type {FontSize} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (fontSize: FontSize, options: ParseDeclarationOptionsWithValueWarning) => {
  switch (fontSize.type) {
    case 'length':
      return parseLength(fontSize.value, options);
    case 'absolute':
    case 'relative':
      options.addValueWarning(fontSize.value);
      return undefined;
  }
}
