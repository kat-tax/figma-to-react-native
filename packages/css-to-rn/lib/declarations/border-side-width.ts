import parseLength from './length';

import type {BorderSideWidth} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default (borderSideWidth: BorderSideWidth, options: ParseDeclarationOptionsWithValueWarning) => {
  if (borderSideWidth.type === 'length') {
    return parseLength(borderSideWidth.value, options);
  }

  options.addValueWarning(borderSideWidth.type);
  return undefined;
}
