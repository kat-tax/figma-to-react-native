import {getSize} from './utils/getSize';
import type {StylesDimension} from 'types/styles';

export function dimension(node: any, isText?: boolean): StylesDimension {
  const style: StylesDimension = {};
  const size = getSize(node);
  if (!isText && typeof size.width === 'number') {
    style.width = size.width;
  } else if (size.width === 'full') {
    if ('layoutMode' in node.parent && node.parent.layoutMode === 'HORIZONTAL') {
      style.flex = 1;
    } else {
      style.width = '100%';
    }
  }

  if (typeof size.height === 'number') {
    style.height = size.height;
  } else if (typeof size.height === 'string') {
    if ('layoutMode' in node.parent && node.parent.layoutMode === 'VERTICAL') {
      style.flex = 1;
    } else {
      style.height = '100%';
    }
  }

  return style;
}
