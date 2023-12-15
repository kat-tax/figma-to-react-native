import type {TextDecorationLine} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (textDecorationLine: TextDecorationLine, options: ParseDeclarationOptionsWithValueWarning) => {
  if (!Array.isArray(textDecorationLine)) {
    if (textDecorationLine === 'none') {
      return textDecorationLine;
    }
    options.addValueWarning(textDecorationLine);
    return;
  }

  const set = new Set(textDecorationLine);

  if (set.has('underline')) {
    if (set.has('line-through')) {
      return 'underline line-through';
    } else {
      return 'underline';
    }
  } else if (set.has('line-through')) {
    return 'line-through';
  }

  options.addValueWarning(textDecorationLine.join(' '));
  return undefined;
}
