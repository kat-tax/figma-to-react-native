import type {FontStyle} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (fontStyle: FontStyle, options: ParseDeclarationOptionsWithValueWarning) => {
  switch (fontStyle.type) {
    case 'normal':
    case 'italic':
      return fontStyle.type;
    case 'oblique':
      options.addValueWarning(fontStyle.type);
      return undefined;
  }
}
