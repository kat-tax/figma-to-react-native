import parseLength from './length';

import type {LengthPercentageOrAuto} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (lengthPercentageOrAuto: LengthPercentageOrAuto, options: ParseDeclarationOptionsWithValueWarning) => {
  switch (lengthPercentageOrAuto.type) {
    case 'auto':
      options.addValueWarning(lengthPercentageOrAuto.type);
      return;
    case 'length-percentage':
      return parseLength(lengthPercentageOrAuto.value, options);
  }
}
