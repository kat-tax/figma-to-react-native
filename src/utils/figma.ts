import type {TargetNode} from 'types/figma';
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

export function reactionsToProps(reactions: ReadonlyArray<Reaction>) {
  const attributes = [];

  for (let {trigger, action} of reactions) {
    let attr: string | null = null
    switch (trigger.type) {
      case 'ON_CLICK':
        attr = 'onPress';
        break;
      case 'MOUSE_DOWN':
        attr = 'onPressDown';
        break;
      case 'ON_PRESS':
      case 'MOUSE_UP':
        attr = 'onpointerup';
        break;
      case 'ON_HOVER':
        attr = 'onmouseover';
        break;
    }
    if (attr == null) continue;
  }

  return attributes.join(" ");
}

// Map Figma color to RGB or HEX
export function colorToCSS(color: RGB, opacity?: number, skipHex?: boolean): string {
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

export function colorFromPaints(fills: ReadonlyArray<Paint>): string | null {
  const firstColor = fills.find(f => f.type === 'SOLID' && f.visible) as SolidPaint;
  if (firstColor == null) return null;
  return colorToCSS(firstColor.color, firstColor.opacity || 1.0);
}
