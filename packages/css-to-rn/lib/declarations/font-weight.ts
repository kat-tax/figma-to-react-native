import type {FontWeight} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default (fontWeight: FontWeight, options: ParseDeclarationOptionsWithValueWarning) => {
  switch (fontWeight.type) {
    case 'absolute':
      if (fontWeight.value.type === 'weight') {
        return fontWeight.value.value.toString();
      } else {
        return fontWeight.value.type;
      }
    case 'bolder':
    case 'lighter':
      options.addValueWarning(fontWeight.type);
      return;
  }
}
