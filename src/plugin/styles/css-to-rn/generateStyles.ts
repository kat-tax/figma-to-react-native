import {convertToReactNative} from './utils/convertToReactNative';
import {processStyles} from './utils/processStyles';

import type {ParseStyles} from 'types/parse';

export async function generateStyles(node: SceneNode): Promise<ParseStyles> {
  const css = await node.getCSSAsync();
  const styles = convertToReactNative(css);
  return processStyles(styles);
}
