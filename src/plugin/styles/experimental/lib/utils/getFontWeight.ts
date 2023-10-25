export function getFontWeight(style: string) {
  if (!style) return '400';
  switch (style.replace(/\s*italic\s*/i, '')) {
    case 'Thin':
      return '100';
    case 'Extra Light':
    case 'Extra-light':
      return '200';
    case 'Light':
      return '300';
    case 'Regular':
      return '400';
    case 'Medium':
      return '500';
    case 'Semi Bold':
    case 'Semi-bold':
      return '600';
    case 'Bold':
      return '700';
    case 'Extra Bold':
    case 'Extra-bold':
      return '800';
    case 'Black':
      return '900';
  }
  return '400';
}
