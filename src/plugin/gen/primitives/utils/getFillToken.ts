import {getColor, getTopFill} from 'plugin/fig/lib';

export function getFillToken(node: RectangleNode | EllipseNode) {
  const placeholder = '"#000000"';
  if (!node) return placeholder;
  const fill = getTopFill(node.fills);
  if (!fill) return placeholder;
  const fillId = fill?.boundVariables?.color?.id;
  const fillVar = fillId && figma.variables.getVariableById(fillId);
  return fillVar && fillVar.resolvedType === 'COLOR'
    ? `theme.colors.${fillVar.name}`
    : `"${getColor(fill.color, fill.opacity)}"`
}
