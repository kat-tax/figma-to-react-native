import type {TargetNode} from 'types/figma';

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

// Strip invalid characters for a JS identifier
export function getName(value: string) {
  const safe = value.replace(/[^a-zA-Z0-9_$]+/g, '');
  if (!isNaN(parseInt(safe))) {
    return '_' + safe;
  } else {
    return safe;
  }
}

// Create slug used for stylesheet properties
export function getSlug(value: string) {
  return value.split(' ').map((word, index) => {
    const safe = getName(word);
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
