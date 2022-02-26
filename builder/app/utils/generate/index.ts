import tamagui from 'utils/generate/tamagui';
import reactNative from 'utils/generate/react-native';
import type {Settings} from 'types/settings';

export default function(node: SceneNode, settings: Settings) {
  switch (settings.output?.react.flavor) {
    case 'tamagui':
      return tamagui(node, settings);
    case 'react-native':
    default:
      return reactNative(node, settings);
  }
}
