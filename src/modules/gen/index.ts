import * as reactNative from 'modules/gen/react-native';

import type {TargetNode} from 'types/figma';
import type {Settings} from 'types/settings';

export function generateBundle(node: TargetNode, settings: Settings, isPreviewMode?: boolean) {
  const instanceSettings = {...settings};
  if (isPreviewMode) {
    instanceSettings.react.addImport = true;
    instanceSettings.react.addTranslate = false;
  }

  switch (settings?.react.flavor) {
    case 'react-native':
    default:
      return reactNative.generateBundle(node, instanceSettings, isPreviewMode);
  }
}

export function generateTheme(settings: Settings) {
  switch (settings?.react.flavor) {
    case 'react-native':
    default:
      return reactNative.generateTheme(settings);
  }
}
