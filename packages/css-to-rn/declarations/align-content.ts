import type {AlignContent} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (alignContent: AlignContent, options: ParseDeclarationOptionsWithValueWarning) => {
  const allowed = new Set([
    'flex-start',
    'flex-end',
    'center',
    'stretch',
    'space-between',
    'space-around',
  ]);

  let value: string | undefined;

  switch (alignContent.type) {
    case 'normal':
    case 'baseline-position':
      value = alignContent.type;
      break;
    case 'content-distribution':
    case 'content-position':
      value = alignContent.value;
      break;
    default: {
      alignContent satisfies never;
    }
  }

  if (value && !allowed.has(value)) {
    options.addValueWarning(value);
    return;
  }

  return value;
}
