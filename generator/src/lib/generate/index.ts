import type {Settings} from 'lib/types/settings';

import tamagui from 'lib/generate/tamagui';
import stylesheet from 'lib/generate/stylesheet';

export default function(node: SceneNode, settings: Settings) {
  switch (settings.output?.react.styling) {
    case 'tamagui':
      return tamagui(node, settings);
    case 'stylesheet':
    default:
      return stylesheet(node, settings);
  }
}
