export function getTag(type: string) {
  switch (type) {
    case 'COMPONENT':
    case 'INSTANCE':
    case 'RECTANGLE':
    case 'ELLIPSE':
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
      return 'View';
  }
}
