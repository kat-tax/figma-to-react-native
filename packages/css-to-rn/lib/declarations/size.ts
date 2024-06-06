import parseLength from './length';

import type {Size, MaxSize} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

type ParseSizeOptions = ParseDeclarationOptionsWithValueWarning & {
  allowAuto?: boolean;
};

export default (size: Size | MaxSize, {allowAuto = false, ...options}: ParseSizeOptions) => {
  switch (size.type) {
    case 'length-percentage':
      return parseLength(size.value, options);
    case 'none':
      return size.type;
    case 'auto':
      if (allowAuto) {
        return size.type;
      } else {
        options.addValueWarning(size.type);
        return undefined;
      }
    case 'min-content':
    case 'max-content':
    case 'fit-content':
    case 'fit-content-function':
    case 'stretch':
    case 'contain':
      options.addValueWarning(size.type);
      return undefined;
  }
}
