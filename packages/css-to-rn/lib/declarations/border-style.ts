import type {BorderStyle, LineStyle} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default (borderStyle: BorderStyle | LineStyle, options: ParseDeclarationOptionsWithValueWarning) => {
  const allowed = new Set(['solid', 'dotted', 'dashed']);

  if (typeof borderStyle === 'string') {
    if (allowed.has(borderStyle)) {
      return borderStyle;
    } else {
      options.addValueWarning(borderStyle);
      return undefined;
    }
  } else if (
    borderStyle.top === borderStyle.bottom &&
    borderStyle.top === borderStyle.left &&
    borderStyle.top === borderStyle.right &&
    allowed.has(borderStyle.top)
  ) {
    return borderStyle.top;
  }

  options.addValueWarning(JSON.stringify(borderStyle.top));

  return undefined;
}
