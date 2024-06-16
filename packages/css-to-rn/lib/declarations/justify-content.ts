import type {JustifyContent} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default (justifyContent: JustifyContent, options: ParseDeclarationOptionsWithValueWarning) => {
  const allowed = new Set([
    'flex-start',
    'flex-end',
    'center',
    'space-between',
    'space-around',
    'space-evenly',
  ]);

  let value: string | undefined;

  switch (justifyContent.type) {
    case 'normal':
    case 'left':
    case 'right':
      value = justifyContent.type;
      break;
    case 'content-distribution':
    case 'content-position':
      value = justifyContent.value;
      break;
    default: {
      justifyContent satisfies never;
    }
  }

  if (value && !allowed.has(value)) {
    options.addValueWarning(value);
    return;
  }

  return value;
}
