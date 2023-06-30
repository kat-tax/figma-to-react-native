import {generateBundle as genReactNativeBundle} from './react-native/bundle';
import {generateTheme as genReactNativeTheme} from './react-native/theme';
import {generateBundle as genTamaguiBundle} from './react-native/bundle';
import {generateTheme as genTamaguiTheme} from './react-native/theme';

import type {TargetNode} from 'types/figma';
import type {Settings} from 'types/settings';

export {generateIndex} from './common/index';

export function generateBundle(node: TargetNode, settings: Settings, isPreviewMode?: boolean) {
  const instanceSettings = {...settings};
  if (isPreviewMode) {
    instanceSettings.react.addImport = false;
    instanceSettings.react.addTranslate = false;
  }

  switch (settings?.react.flavor) {
    case 'tamagui':
      return genTamaguiBundle(node, instanceSettings, isPreviewMode);
    case 'react-native':
    default:
      return genReactNativeBundle(node, instanceSettings, isPreviewMode);
  }
}

export function generateTheme(settings: Settings) {
  switch (settings?.react.flavor) {
    case 'tamagui':
      return genTamaguiTheme(settings);
    case 'react-native':
    default:
      return genReactNativeTheme(settings);
  }
}

