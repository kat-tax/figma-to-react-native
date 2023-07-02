import {generateBundle as genReactNativeBundle} from './react-native/bundle';
import {generateTheme as genReactNativeTheme} from './react-native/theme';
import {generateBundle as genTamaguiBundle} from './react-native/bundle';
import {generateTheme as genTamaguiTheme} from './react-native/theme';

import type {Settings} from 'types/settings';
import type {TargetNode} from 'types/figma';
import type {EditorComponent} from 'types/editor';

export {generateIndex} from './common/index';

export async function generateBundle(node: TargetNode, settings: Settings, isPreviewMode?: boolean) {
  const instanceSettings = {...settings};
  if (isPreviewMode) {
    instanceSettings.react.addImport = false;
    instanceSettings.react.addTranslate = false;
  }

  let bundle: EditorComponent;
  switch (settings?.react.flavor) {
    case 'tamagui':
      bundle = await genTamaguiBundle(node, instanceSettings, isPreviewMode);
    case 'react-native':
    default:
      bundle = await genReactNativeBundle(node, instanceSettings, isPreviewMode);
  }

  return bundle;
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

