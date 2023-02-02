export function getTag(type: string) {
  switch (type) {
    case 'COMPONENT':
    case 'GROUP':
      return 'View';
    case 'TEXT':
      return 'Text';
    case 'IMAGE':
      return 'Image';
    default:
      return 'Unknown';
  }
}

export function getName(value: string) {
  return value.replace(/\s/g, '');
}

export function getSlug(value: string) {
  return value.split(' ').map((word, index) => {
    if (index == 0) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
}
