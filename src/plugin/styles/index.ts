import {generateStyles as experimental} from './experimental/generateStyles';
import {generateStyles as service} from './service/generateStyles';
import {generateStyles as css} from './css-to-rn/generateStyles';

import type {ParseStyles} from 'types/parse';
import type {Settings} from 'types/settings';

export function generateStyles(node: SceneNode, settings: Settings): Promise<ParseStyles> {
  switch (settings?.react.styleGen) {
    case 'experimental':
      return experimental(node);
    case 'service':
      return service(node);
    case 'default':
      default:
      return css(node);
  }
}
