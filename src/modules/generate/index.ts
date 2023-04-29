import * as reactNative from 'modules/generate/react-native';
import * as tamagui from 'modules/generate/react-native';

import type {TargetNode} from 'types/figma';
import type {Settings} from 'types/settings';

export function generateBundle(node: TargetNode, settings: Settings, skipBundle?: boolean) {
  switch (settings.output?.react.flavor) {
    case 'tamagui':
      return tamagui.generateBundle(node, settings, skipBundle);
    case 'react-native':
    default:
      return reactNative.generateBundle(node, settings, skipBundle);
  }
}

export function generateTheme(settings: Settings) {
  switch (settings.output?.react.flavor) {
    case 'tamagui':
      return tamagui.generateTheme(settings);
    case 'react-native':
    default:
      return reactNative.generateTheme(settings);
  }
}
