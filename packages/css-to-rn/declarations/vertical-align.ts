import type {VerticalAlign} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (verticalAlign: VerticalAlign, options: ParseDeclarationOptionsWithValueWarning) => {
  if (verticalAlign.type === 'length') {
    return undefined;
  }

  const allowed = new Set(['auto', 'top', 'bottom', 'middle']);

  if (allowed.has(verticalAlign.value)) {
    return verticalAlign.value;
  }

  options.addValueWarning(verticalAlign.value);
  return undefined;
}
