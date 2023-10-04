import {generateStyles as experimentalStyles} from './experimental/generateStyles';
import {generateStyles as defaultStyles} from './default/generateStyles';
import {generateStyles as premiumStyles} from './premium/generateStyles';

import type {ParseStyles} from 'types/parse';
import type {Settings} from 'types/settings';

export function generateStyles(node: SceneNode, settings: Settings): Promise<ParseStyles> {
  switch (settings?.react.styleGen) {
    case 'experimental':
      return experimentalStyles(node);
    case 'premium':
      return premiumStyles(node);
    case 'default':
    default:
      return defaultStyles(node);
  }
}
