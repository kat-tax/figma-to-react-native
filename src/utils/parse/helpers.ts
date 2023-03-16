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
