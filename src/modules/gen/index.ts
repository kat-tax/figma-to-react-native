import * as reactNative from 'modules/gen/react-native';

import type {TargetNode} from 'types/figma';
import type {Settings} from 'types/settings';

export function generateBundle(node: TargetNode, settings: Settings, skipBundle?: boolean) {
  switch (settings?.react.flavor) {
    case 'react-native':
    default:
      return reactNative.generateBundle(node, settings, skipBundle);
  }
}

export function generateTheme(settings: Settings) {
  switch (settings?.react.flavor) {
    case 'react-native':
    default:
      return reactNative.generateTheme(settings);
  }
}
