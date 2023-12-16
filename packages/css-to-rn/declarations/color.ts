import type {CssColor} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (color: CssColor, options: ParseDeclarationOptionsWithValueWarning) => {
  switch (color.type) {
    case 'rgb':
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.alpha})`;
    case 'hsl':
      return `hsla(${color.h}, ${color.s}, ${color.l}, ${color.alpha})`;
    case 'currentcolor':
      options.addValueWarning(color.type);
      return;
    case 'lab':
    case 'lch':
    case 'oklab':
    case 'oklch':
    case 'srgb':
    case 'srgb-linear':
    case 'display-p3':
    case 'a98-rgb':
    case 'prophoto-rgb':
    case 'rec2020':
    case 'xyz-d50':
    case 'xyz-d65':
    case 'hwb':
      options.addValueWarning(`Invalid color unit ${color.type}`);
      return undefined;
  }
}
