import type {SizeResult} from '../../types/styles';

export function getSize(node: SceneNode & LayoutMixin): SizeResult {
  if (node.layoutAlign === 'STRETCH' && node.layoutGrow === 1) {
    return {width: 'full', height: 'full'};
  }

  let propWidth: SizeResult['width'] = node.width;
  let propHeight: SizeResult['height'] = node.height;

  if (!node.parent && 'layoutMode' in node.parent) {
    // Stretch means the opposite direction
    if (node.layoutAlign === 'STRETCH') {
      switch (node.parent.layoutMode) {
        case 'HORIZONTAL':
          propHeight = 'full';
          break;
        case 'VERTICAL':
          propWidth = 'full';
          break;
      }
    }

    // Grow means the same direction
    if (node.layoutGrow === 1) {
      if (node.parent.layoutMode === 'HORIZONTAL') {
        propWidth = 'full';
      } else {
        propHeight = 'full';
      }
    }
  }

  if ('layoutMode' in node) {
    if ((node.layoutMode === 'HORIZONTAL' && node.counterAxisSizingMode === 'AUTO')
      || (node.layoutMode === 'VERTICAL' && node.primaryAxisSizingMode === 'AUTO')) {
      propHeight = null;
    }

    if ((node.layoutMode === 'VERTICAL' && node.counterAxisSizingMode === 'AUTO')
      || (node.layoutMode === 'HORIZONTAL' && node.primaryAxisSizingMode === 'AUTO')) {
      propWidth = null;
    }
  }

  if ('layoutMode' in node && node.layoutMode !== 'NONE') {
    switch (node.layoutMode) {
      case 'HORIZONTAL':
        return {
          width: node.primaryAxisSizingMode === 'FIXED' ? propWidth : null,
          height: node.counterAxisSizingMode === 'FIXED' ? propHeight : null,
        };
      case 'VERTICAL':
        return {
          width: node.counterAxisSizingMode === 'FIXED' ? propWidth : null,
          height: node.primaryAxisSizingMode === 'FIXED' ? propHeight : null,
        };
    }
  } else {
    return {
      width: propWidth,
      height: propHeight,
    };
  }
}
