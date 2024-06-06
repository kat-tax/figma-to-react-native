import type {OverflowKeyword} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default (overflow: OverflowKeyword, options: ParseDeclarationOptionsWithValueWarning) => {
  const allowed = new Set(['visible', 'hidden']);

  if (allowed.has(overflow)) {
    return overflow;
  }

  options.addValueWarning(overflow);
  return undefined;
}
