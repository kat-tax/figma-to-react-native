import type {StylesPadding} from './style.types';

export function padding(node: any): StylesPadding {
  const style: StylesPadding = {};
  if (node.paddingLeft > 0
    && node.paddingLeft === node.paddingRight
    && node.paddingLeft === node.paddingBottom
    && node.paddingTop === node.paddingBottom) {
    style.padding = node.paddingLeft;
  } else {
    if (node.paddingTop !== node.paddingBottom) {
      if (node.paddingTop !== 0)
        style.paddingTop = node.paddingTop;
      if (node.paddingBottom !== 0)
        style.paddingBottom = node.paddingBottom;
    } else if (node.paddingTop !== 0) {
      style.paddingVertical = node.paddingTop;
    }
    if (node.paddingLeft !== node.paddingRight) {
      if (node.paddingLeft !== 0)
        style.paddingLeft = node.paddingLeft;
      if (node.paddingRight !== 0)
        style.paddingRight = node.paddingRight;
    } else if (node.paddingLeft !== 0) {
      style.paddingHorizontal = node.paddingLeft;
    }
  }
  return style;
}
