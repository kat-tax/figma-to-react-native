import {getColor} from 'modules/fig/lib';
import * as helpers from './helpers';
import type {StylesBackground} from 'types/styles';

export function background(node: any): StylesBackground {
  const style: StylesBackground = {};

  if (node.backgrounds?.length > 0) {
    const fill = helpers.getTopFill(node.backgrounds);
    const fillStyle = helpers.getFillStyle(figma.getStyleById(node.fillStyleId));
    style.backgroundColor = fillStyle ?? getColor(fill?.color, fill?.opacity);
  }

  return style;
}
