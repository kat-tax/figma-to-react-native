import type {TextDecorationStyle} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default (textDecorationStyle: TextDecorationStyle, options: ParseDeclarationOptionsWithValueWarning) => {
  const allowed = new Set(['solid', 'double', 'dotted', 'dashed']);

  if (allowed.has(textDecorationStyle)) {
    return textDecorationStyle;
  }

  options.addValueWarning(textDecorationStyle);
  return undefined;
}
