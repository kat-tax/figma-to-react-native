import parseLength from './length';

import type {GapValue} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default (value: GapValue, options: ParseDeclarationOptionsWithValueWarning) => {
  if (value.type === 'normal') {
    options.addValueWarning(value.type);
    return;
  }
  return parseLength(value.value, options);
}
