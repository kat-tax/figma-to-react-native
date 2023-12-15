import type {AlignItems} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (alignItems: AlignItems, options: ParseDeclarationOptionsWithValueWarning) => {
  const allowed = new Set([
    'auto',
    'flex-start',
    'flex-end',
    'center',
    'stretch',
    'baseline',
  ]);

  let value: string | undefined;

  switch (alignItems.type) {
    case 'normal':
      value = 'auto';
      break;
    case 'stretch':
      value = alignItems.type;
      break;
    case 'baseline-position':
      value = 'baseline';
      break;
    case 'self-position':
      value = alignItems.value;
      break;
    default: {
      alignItems satisfies never;
    }
  }

  if (value && !allowed.has(value)) {
    options.addValueWarning(value);
    return;
  }

  return value;
}
