import type {Settings} from 'lib/types/settings';

import tamagui from 'lib/build/tamagui';
import reactNative from 'lib/build/react-native';

export default function(node: SceneNode, settings: Settings) {
  switch (settings.output?.react.flavor) {
    case 'tamagui':
      return tamagui(node, settings);
    case 'react-native':
    default:
      return reactNative(node, settings);
  }
}
