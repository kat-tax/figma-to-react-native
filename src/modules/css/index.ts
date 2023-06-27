import {generateStyles as genFigmaStyles} from './figma/generateStyles';
import {generateStyles as genExperimentalStyles} from './experimental/generateStyles';

import type {NodeStyles} from 'types/figma';
import type {Settings} from 'types/settings';

export function generateStyles(node: SceneNode, settings: Settings): Promise<NodeStyles> {
  switch (settings?.react.styleGen) {
    case 'experimental':
      return genExperimentalStyles(node);
    case 'figma':
    default:
      return genFigmaStyles(node);
  }
}
