import type {Settings} from 'lib/types/settings';
import genStyleSheet from 'lib/generators/stylesheet';
import genTamagui from 'lib/generators/tamagui';

export default function(node: SceneNode, settings: Settings) {
  switch (settings.output?.react.styling) {
    case 'tamagui':
      return genTamagui(node, settings);
    case 'stylesheet':
    default:
      return genStyleSheet(node, settings);
  }
}
