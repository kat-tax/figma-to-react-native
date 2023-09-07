export function getLetterSpacing(node: TextNode): number | undefined {
  if (node.letterSpacing !== figma.mixed && Math.round(node.letterSpacing.value) !== 0) {
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
