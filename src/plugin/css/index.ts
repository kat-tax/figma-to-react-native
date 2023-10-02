import {generateStyles as generateFigmaStyles} from './figma/generateStyles';
import {generateStyles as generateExperimentalStyles} from './experimental/generateStyles';

import type {ParseStyles} from 'types/parse';
import type {Settings} from 'types/settings';

export function generateStyles(node: SceneNode, settings: Settings): Promise<ParseStyles> {
  switch (settings?.react.styleGen) {
    case 'experimental':
      return generateExperimentalStyles(node);
    case 'figma':
    default:
      return generateFigmaStyles(node);
  }
}
