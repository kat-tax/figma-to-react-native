import type {TargetNode, SizeResult} from 'types/figma';

import {rgbToHex} from 'utils/common';

// Return the selected component, if child look upward
export function getSelectedComponent() {
  const {selection} = figma.currentPage;
  if (selection.length === 0)
    return null;
  let root: TargetNode = selection[0];
  if (root.type === 'COMPONENT')
    return selection[0];
  while (root.parent && root.parent.type !== 'PAGE') {
    root = root.parent;
    if (root.type === 'COMPONENT')
    return root;
  }
  return null;
}

// Get the page of a node
export function getPage(node: BaseNode) {
  while (node.type !== 'PAGE') {
    node = node.parent;
    if (!node) return false;
  }
  return node;
}

// Strip invalid characters for a JS identifier
export function getName(value: string, skipPrefix?: boolean) {
  // Remove all non-alphanumeric characters
  let safe = value.replace(/[^a-zA-Z0-9$]+/g, '');
  // Prefix with a $ if the first character is a number
  if (!skipPrefix && !isNaN(parseInt(safe))) {
    return '$' + safe;
  } else {
    return safe;
  }
}

// Create slug used for stylesheet properties
export function getSlug(value: string, skipPrefix?: boolean) {
  return value.split(' ').map((word, index) => {
    const safe = getName(word, skipPrefix);
    if (index == 0) return safe.toLowerCase();
    return safe.charAt(0).toUpperCase() + safe.slice(1).toLowerCase();
  }).join('');
}

// Map Figma node types to React Native primitives
export function getTag(type: string) {
  switch (type) {
    case 'COMPONENT':
    case 'INSTANCE':
    case 'FRAME':
    case 'GROUP':
      return 'View';
    case 'TEXT':
      return 'Text';
    case 'IMAGE':
      return 'Image';
    case 'VECTOR':
      return 'Svg';
    default:
      return 'Unknown';
  }
}

// Convert props map to a string
export function propsToString(props: any) {
  if (!props) return '';
  const attrs = Object.entries(props);
  if (attrs.length === 0) return '';
  return ' ' + Object.entries(props)
    .sort(sortProps)
    .map(propsToKeyValues)
    .filter(Boolean)
    .join(' ');
}

// Sort props to the proper JSX order
export function sortProps(a: any, b: any) {
  // Booleans are always first
  if (a[1].type === 'BOOLEAN') {
    return -1;
  // Otherwise sort alphabetically
  } else {
    return a[0] - b[0];
  }
}

// Map Figma component props to JSX key values
export function propsToKeyValues([key, prop]) {
  const {value, type}: any = prop;
  const name = getSlug(key.split('#').shift());
  // Boolean prop shorthand (omit if false)
  if (type === 'BOOLEAN') {
    return value ? name : false;
  // Variant and text prop are simply k="v"
  } else if (type === 'TEXT' || type === 'VARIANT') {
    return `${name}="${value}"`;
  }
}

// Map Figma color to RGB or HEX
export function getColor(color: RGB, opacity?: number, skipHex?: boolean): string {
  if (!color) return;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = opacity > 0 && opacity < 1 ? `, ${opacity}` : '';
  if (skipHex) {
    return `rgb${a?'a':''}(${r}, ${g}, ${b}${a})`;
  } else {
    return rgbToHex(r, g, b, opacity);
  }
}

export function getTopFill(fills: ReadonlyArray<Paint> | PluginAPI['mixed']): SolidPaint | undefined {
  if (fills && fills !== figma.mixed && fills.length > 0) {
    return [...fills].reverse().find((d) => d.type === 'SOLID' && d.visible !== false) as SolidPaint;
  }
}

export function getFillStyle(style: BaseStyle) {
  let fillKey: string;
  if (style?.name) {
    const [fillGroup, fillToken] = style.name.split('/');
    fillKey = `colors.${getSlug(fillGroup)}.${getSlug(fillToken)}`;
  }
  return fillKey;
}

export function getSize(node: TargetNode, isRoot: boolean): SizeResult {
  if (node.layoutAlign === 'STRETCH' && node.layoutGrow === 1) {
    return {width: 'full', height: 'full'};
  }

  let propWidth: SizeResult['width'] = node.width;
  let propHeight: SizeResult['height'] = node.height;

  if (!isRoot && node.parent && 'layoutMode' in node.parent) {
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

export function getLineHeight(node: TargetNode): number | undefined {
  if (node.lineHeight !== figma.mixed
    && node.lineHeight.unit !== 'AUTO'
    && Math.round(node.lineHeight.value) !== 0) {
    if (node.lineHeight.unit === 'PIXELS') {
      return node.lineHeight.value;
    } else {
      if (node.fontSize !== figma.mixed) {
        return (node.fontSize * node.lineHeight.value) / 100;
      }
    }
  }
  return undefined;
}

export function getLetterSpacing(node: TargetNode): number | undefined {
  if (node.letterSpacing !== figma.mixed
    && Math.round(node.letterSpacing.value) !== 0) {
    if (node.letterSpacing.unit === 'PIXELS') {
      return node.letterSpacing.value;
    } else {
      if (node.fontSize !== figma.mixed) {
        return (node.fontSize * node.letterSpacing.value) / 100;
      }
    }
  }
  return undefined;
}

export function getFontWeight(style: string) {
  switch (style.replace(/\s*italic\s*/i, '')) {
    case 'Thin':
      return 100;
    case 'Extra Light':
    case 'Extra-light':
      return 200;
    case 'Light':
      return 300;
    case 'Regular':
      return 400;
    case 'Medium':
      return 500;
    case 'Semi Bold':
    case 'Semi-bold':
      return 600;
    case 'Bold':
      return 700;
    case 'Extra Bold':
    case 'Extra-bold':
      return 800;
    case 'Black':
      return 900;
  }
  return 400;
}
