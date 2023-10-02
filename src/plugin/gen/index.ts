import * as tamagui from './react-native';
import * as reactNative from './react-native';

import type {Settings} from 'types/settings';
import type {PreviewComponent} from 'types/preview';

export {generateIndex} from './common';

export async function generateBundle(node: ComponentNode, settings: Settings, isPreviewMode?: boolean) {
  const instanceSettings = {...settings};
  if (isPreviewMode) {
    instanceSettings.react.addImport = false;
    instanceSettings.react.addTranslate = false;
  }

  let bundle: PreviewComponent;
  switch (settings?.react.flavor) {
    case 'tamagui':
      bundle = await tamagui.generateBundle(node, instanceSettings, isPreviewMode);
    case 'react-native':
    default:
      bundle = await reactNative.generateBundle(node, instanceSettings, isPreviewMode);
  }

  return bundle;
}

export function generateTheme(settings: Settings) {
  switch (settings?.react.flavor) {
    case 'tamagui':
      return tamagui.generateTheme(settings);
    case 'react-native':
    default:
      return reactNative.generateTheme(settings);
  }
}
