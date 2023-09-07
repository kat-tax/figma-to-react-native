export function getLineHeight(node: TextNode): number | undefined {
  if (node.lineHeight !== figma.mixed && node.lineHeight.unit !== 'AUTO') {
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
