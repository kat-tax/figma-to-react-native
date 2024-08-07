import * as string from 'common/string';

type FillNodes = 
  | ComponentSetNode
  | ComponentNode
  | InstanceNode
  | FrameNode
  | TextNode
  | StarNode
  | LineNode
  | VectorNode
  | EllipseNode
  | RectangleNode
  | PolygonNode

export function getFillToken(node: FillNodes) {
  const placeholder = '"#000000"';
  if (!node) return placeholder;
  const fill = getTopFill(node.fills);
  if (!fill) return placeholder;
  const fillId = fill?.boundVariables?.color?.id;
  const fillVar = fillId && figma.variables.getVariableById(fillId);
  if (fillVar?.codeSyntax?.WEB)
    return fillVar.codeSyntax.WEB.slice(6,-1).replace(/\-/g, '.');
  return fillVar && fillVar.resolvedType === 'COLOR'
    ? `theme.colors.${string.createIdentifierCamel(fillVar.name)}`
    : `"${getColor(fill.color, fill.opacity)}"`
}

export function getTopFill(fills: ReadonlyArray<Paint> | PluginAPI['mixed']): SolidPaint | undefined {
  if (fills && fills !== figma.mixed && fills.length > 0) {
    return [...fills].reverse().find((fill) =>
      fill.type === 'SOLID' && fill.visible !== false) as SolidPaint;
  }
}

export function getColor(color: RGB, opacity?: number, skipHex?: boolean): string {
  if (!color) return;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = opacity > 0 && opacity < 1 ? `, ${opacity}` : '';
  if (skipHex) {
    return `rgb${a?'a':''}(${r}, ${g}, ${b}${a})`;
  } else {
    return toHex(r, g, b, opacity);
  }
}

function toHex(r: number, g: number, b: number, a?: number) {
  const hexValue = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  if (a !== undefined && a !== 1) {
    const alphaValue = Math.round(a * 255).toString(16).padStart(2, '0');
    return `#${hexValue}${alphaValue}`;
  }
  return `#${hexValue}`;
}
