import reactNative from 'modules/generate/react-native';
// import tamagui from 'utils/generate/tamagui';
import type {TargetNode} from 'types/figma';
import type {Settings} from 'types/settings';

export default function(node: TargetNode, settings: Settings, skipBundle?: boolean) {
  switch (settings.output?.react.flavor) {
    // case 'tamagui':
    //   return tamagui(node, settings);
    case 'react-native':
    default:
      return reactNative(node, settings, skipBundle);
  }
}
