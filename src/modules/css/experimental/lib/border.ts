import {getColor} from 'modules/fig/lib';
import * as helpers from './helpers';
import type {StylesBorder} from 'types/styles';

export function border(node: any): StylesBorder {
  const style: StylesBorder = {};

  // Radius
  if (node.type === 'ELLIPSE') {
    style.borderRadius = 99999;
  } else if (node.cornerRadius !== figma.mixed) {
    style.borderRadius = node.cornerRadius || undefined;
  } else {
    style.borderTopLeftRadius = node.topLeftRadius || undefined;
    style.borderTopRightRadius = node.topRightRadius || undefined;
    style.borderBottomLeftRadius = node.bottomLeftRadius || undefined;
    style.borderBottomRightRadius = node.bottomRightRadius || undefined;
  }

  // Stroke
  if (node.strokes?.length > 0
    // TODO: figure out what to do with "mixed" border strokes (ignore for now)
    && (node.strokeWeight !== figma.mixed && node.strokeWeight > 0)) {
    const fill = helpers.getTopFill(node.strokes);
    style.borderColor = getColor(fill?.color, fill?.opacity);
    style.borderWidth = node.strokeWeight;
    style.borderStyle = node.dashPattern.length > 0 ? 'dotted' : 'solid';
  }

  return style;
}
