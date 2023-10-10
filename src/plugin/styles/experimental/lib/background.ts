import {getColor, getTopFill} from 'plugin/fig/lib';
import {getFillStyle} from './utils/getFillStyle';

import type {StylesBackground} from '../types/styles';

export function background(node: any): StylesBackground {
  const style: StylesBackground = {};

  if (node.backgrounds?.length > 0) {
    const fill = getTopFill(node.backgrounds);
    const fillStyle = getFillStyle(figma.getStyleById(node.fillStyleId));
    style.backgroundColor = fillStyle ?? getColor(fill?.color, fill?.opacity);
  }

  return style;
}
