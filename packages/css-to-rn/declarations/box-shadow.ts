import parseColor from './color';
import parseLength from './length';

import type {BoxShadow} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (boxShadows: BoxShadow[], options: ParseDeclarationOptionsWithValueWarning) => {
  if (boxShadows.length > 1) {
    options.addValueWarning('multiple box shadows');
    return;
  }

  const boxShadow = boxShadows[0];

  options.addStyleProp('shadowColor', parseColor(boxShadow.color, options));
  options.addStyleProp('shadowRadius', parseLength(boxShadow.blur, options));
  options.addStyleProp('shadowOffset', {
    width: parseLength(boxShadow.xOffset, options),
    height: parseLength(boxShadow.yOffset, options),
  });
}
