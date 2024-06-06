import type {Token} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default ({unit, value}: Extract<Token, {type: 'dimension'}>, options: ParseDeclarationOptionsWithValueWarning) => {
  switch (unit) {
    case 'px':
      return value;
    case '%':
      return `${value}%`;
    case 'ch':
    case 'cw':
      return {
        type: 'runtime',
        name: unit,
        arguments: [value / 100],
      };
    default: {
      return options.addValueWarning(`${value}${unit}`);
    }
  }
}
