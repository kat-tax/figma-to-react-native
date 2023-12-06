import {rgbToHex} from 'common/color';

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
    return [...fills].reverse().find((fill) =>
      fill.type === 'SOLID' && fill.visible !== false) as SolidPaint;
  }
}

export function getFillToken(node: RectangleNode | EllipseNode | VectorNode) {
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
