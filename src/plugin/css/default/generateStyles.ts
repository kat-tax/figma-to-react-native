import {convertToReactNative} from './lib/convertToReactNative';
import {shorthandStyles} from './lib/shorthandStyles';
import {processStyles} from './lib/processStyles';

import type {ParseStyles} from 'types/parse';

export async function generateStyles(node: SceneNode): Promise<ParseStyles> {
  const css = await node.getCSSAsync();
  const styles = convertToReactNative(css);
  return shorthandStyles(processStyles(styles));
}
