import type {Angle} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (angle: Angle, options: ParseDeclarationOptionsWithValueWarning) => {
  switch (angle.type) {
    case 'deg':
    case 'rad':
      return `${angle.value}${angle.type}`;
    default:
      options.addValueWarning(angle.value);
      return undefined;
  }
}
