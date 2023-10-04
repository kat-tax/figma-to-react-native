import type {StylesLayout} from './style.types';

export function layout(node: any): StylesLayout {
  const style: StylesLayout = {};

  // if AutoLayout not used, return empty layout
  if (node.layoutPositioning !== 'AUTO') {
    return style;
  }

  style.display = 'flex';
  style.flexDirection = node.layoutMode === 'HORIZONTAL'
    ? 'row'
    : 'column';

  let primaryAlign: string;
  switch (node.primaryAxisAlignItems) {
    case 'MIN':
      primaryAlign = 'flex-start';
      break;
    case 'MAX':
      primaryAlign = 'flex-end';
      break;
    case 'CENTER':
      primaryAlign = 'center';
      break;
    case 'SPACE_BETWEEN':
      primaryAlign = 'space-between';
      break;
  }

  if (primaryAlign !== 'flex-start') {
    style.justifyContent = primaryAlign;
  }

  let counterAlign: string;
  switch (node.counterAxisAlignItems) {
    case 'MIN':
      counterAlign = 'flex-start';
      break;
    case 'MAX':
      counterAlign = 'flex-end';
      break;
    case 'CENTER':
      counterAlign = 'center';
      break;
  }

  if (counterAlign !== 'flex-start') {
    style.alignItems = counterAlign;
  }

  if (node.itemSpacing) {
    style.gap = node.itemSpacing;
  }

  return style;
}
