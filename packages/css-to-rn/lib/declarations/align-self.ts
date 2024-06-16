import type {AlignSelf} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default (alignSelf: AlignSelf, options: ParseDeclarationOptionsWithValueWarning) => {
  const allowed = new Set([
    'auto',
    'flex-start',
    'flex-end',
    'center',
    'stretch',
    'baseline',
  ]);

  let value: string | undefined;

  switch (alignSelf.type) {
    case 'normal':
    case 'auto':
      value = 'auto';
    case 'stretch':
      value = alignSelf.type;
      break;
    case 'baseline-position':
      value = 'baseline';
      break;
    case 'self-position':
      value = alignSelf.value;
      break;
    default: {
      alignSelf satisfies never;
    }
  }

  if (value && !allowed.has(value)) {
    options.addValueWarning(value);
    return;
  }

  return value;
}
