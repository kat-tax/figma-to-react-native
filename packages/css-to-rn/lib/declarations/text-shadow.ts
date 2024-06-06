import parseColor from './color';
import parseLength from './length';

import type {TextShadow} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning, AddStyleProp} from '../types';

export default (
  [textShadow]: TextShadow[],
  addStyleProp: AddStyleProp,
  options: ParseDeclarationOptionsWithValueWarning,
) => {
  addStyleProp('textShadowColor', parseColor(textShadow.color, options));
  addStyleProp('textShadowRadius', parseLength(textShadow.blur, options));
  addStyleProp('textShadowOffset', {
    width: parseLength(textShadow.xOffset, options),
    height: parseLength(textShadow.yOffset, options),
  });
}
