import type {TextAlign} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (textAlign: TextAlign, options: ParseDeclarationOptionsWithValueWarning) => {
  const allowed = new Set(['auto', 'left', 'right', 'center', 'justify']);

  if (allowed.has(textAlign)) {
    return textAlign;
  }

  options.addValueWarning(textAlign);
  return undefined;
}
